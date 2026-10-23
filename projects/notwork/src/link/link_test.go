// Tests for section 01: a raw link on one interface.
//
// They run over the test cable that netsetup.sh sets up: the stack's end is
// nw-stack (normal namespace), the kernel's end is nw-kernel (10.77.0.1, in the
// network namespace "notwork"). The kernel is the oracle: it must send frames
// your Read returns intact, and it must accept and answer a frame your Write sends.
//
// Run them as root (raw sockets need CAP_NET_RAW), from src/:
//
//	sudo ./scripts/netsetup.sh setup   (wherever you keep the script)
//	go test -exec sudo ./link/
//
// The tests are in the order you'll get them working. Without root or without
// the cable, the ones that need them are skipped, with a message saying why.
package link_test

import (
	"bytes"
	"encoding/json"
	"errors"
	"net"
	"os"
	"os/exec"
	"testing"
	"time"

	"notwork/link"
)

const (
	stackIface  = "nw-stack"
	kernelIface = "nw-kernel"
	netns       = "notwork"
)

var (
	kernelIP  = net.IPv4(10, 77, 0, 1).To4()
	stackIP   = net.IPv4(10, 77, 0, 2).To4()
	broadcast = net.HardwareAddr{0xff, 0xff, 0xff, 0xff, 0xff, 0xff}
)

// frameBuf is big enough for any frame on the cable (MTU 1500 + 14-byte header).
const frameBuf = 2048

// needCable skips the test unless it runs as root and the test cable exists.
func needCable(t *testing.T) {
	t.Helper()
	if os.Geteuid() != 0 {
		t.Skip("needs root to open raw sockets: run as  go test -exec sudo ./link/")
	}
	if _, err := net.InterfaceByName(stackIface); err != nil {
		t.Skipf("no %s interface: run  sudo ./netsetup.sh setup  first", stackIface)
	}
}

// openStack opens nw-stack with the code under test, and closes it when the test ends.
func openStack(t *testing.T) *link.Conn {
	t.Helper()
	c, err := link.Open(stackIface)
	if err != nil {
		t.Fatalf("Open(%q): %v", stackIface, err)
	}
	t.Cleanup(func() { c.Close() })
	return c
}

// inNetns runs a command on the kernel's side of the cable.
func inNetns(name string, args ...string) *exec.Cmd {
	return exec.Command("ip", append([]string{"netns", "exec", netns, name}, args...)...)
}

// kernelMAC asks ip(8) for the MAC address of the kernel's end of the cable.
func kernelMAC(t *testing.T) net.HardwareAddr {
	t.Helper()
	out, err := exec.Command("ip", "-n", netns, "-j", "link", "show", kernelIface).Output()
	if err != nil {
		t.Fatalf("ip -n %s link show %s: %v", netns, kernelIface, err)
	}
	var links []struct {
		Address string `json:"address"`
	}
	if err := json.Unmarshal(out, &links); err != nil || len(links) != 1 {
		t.Fatalf("can't read %s's MAC from ip's output %q: %v", kernelIface, out, err)
	}
	mac, err := net.ParseMAC(links[0].Address)
	if err != nil {
		t.Fatalf("%s has an unexpected MAC %q: %v", kernelIface, links[0].Address, err)
	}
	return mac
}

// readUntil reads frames until one satisfies match, or the time runs out. Every
// frame read (matching or not) is passed to seen first, if seen isn't nil. It
// returns the matching frame, or nil and the number of other frames read.
func readUntil(t *testing.T, c *link.Conn, wait time.Duration, seen func([]byte), match func([]byte) bool) ([]byte, int) {
	t.Helper()
	if err := c.SetReadDeadline(time.Now().Add(wait)); err != nil {
		t.Fatalf("SetReadDeadline: %v", err)
	}
	others := 0
	buf := make([]byte, frameBuf)
	for {
		n, err := c.Read(buf)
		if errors.Is(err, os.ErrDeadlineExceeded) {
			return nil, others
		}
		if err != nil {
			t.Fatalf("Read: %v", err)
		}
		frame := append([]byte(nil), buf[:n]...)
		if seen != nil {
			seen(frame)
		}
		if match(frame) {
			return frame, others
		}
		others++
	}
}

// isARP reports whether frame carries an ARP message with the given operation
// (1 = request, 2 = reply), at least as long as an ARP frame is.
// Offsets: Ethernet header 0-13 (EtherType at 12), ARP from 14 (operation at 20).
func isARP(frame []byte, op byte) bool {
	return len(frame) >= 42 &&
		frame[12] == 0x08 && frame[13] == 0x06 &&
		frame[20] == 0x00 && frame[21] == op
}

// arpRequest builds the frame the stack would send to ask "who has 10.77.0.1?".
// It's a test fixture: building ARP messages is section 03's job.
func arpRequest(from net.HardwareAddr) []byte {
	var f []byte
	f = append(f, broadcast...)       // destination: everyone on the link
	f = append(f, from...)            // source: the stack's end of the cable
	f = append(f, 0x08, 0x06)         // EtherType: ARP
	f = append(f, 0x00, 0x01)         // hardware type: Ethernet
	f = append(f, 0x08, 0x00)         // protocol type: IPv4
	f = append(f, 6, 4)               // address lengths: MAC 6, IPv4 4
	f = append(f, 0x00, 0x01)         // operation: request
	f = append(f, from...)            // sender MAC
	f = append(f, stackIP...)         // sender IP
	f = append(f, make([]byte, 6)...) // target MAC: unknown, that's the question
	f = append(f, kernelIP...)        // target IP
	return f
}

// 1. Opening an interface that doesn't exist must fail (no root needed).
func TestOpenUnknownInterface(t *testing.T) {
	c, err := link.Open("nw-nosuchif")
	if err == nil {
		c.Close()
		t.Fatal(`Open("nw-nosuchif") returned no error, but there is no such interface`)
	}
}

// 2. The stack's end of the cable opens and closes.
func TestOpenClose(t *testing.T) {
	needCable(t)
	c, err := link.Open(stackIface)
	if err != nil {
		t.Fatalf("Open(%q): %v", stackIface, err)
	}
	if err := c.Close(); err != nil {
		t.Fatalf("Close: %v", err)
	}
}

// 3. The cable is quiet, so a Read with a deadline must give up when it passes.
func TestReadDeadline(t *testing.T) {
	needCable(t)
	c := openStack(t)

	const wait = 200 * time.Millisecond
	if err := c.SetReadDeadline(time.Now().Add(wait)); err != nil {
		t.Fatalf("SetReadDeadline: %v", err)
	}
	start := time.Now()
	n, err := c.Read(make([]byte, frameBuf))
	took := time.Since(start)

	switch {
	case err == nil:
		t.Fatalf("Read returned a %d-byte frame on a quiet cable; expected it to time out after %v", n, wait)
	case !errors.Is(err, os.ErrDeadlineExceeded):
		t.Fatalf("Read failed with %v; expected an error that errors.Is reports as os.ErrDeadlineExceeded", err)
	case took < wait/2:
		t.Fatalf("Read timed out after %v, before the %v deadline", took, wait)
	case took > 2*time.Second:
		t.Fatalf("Read timed out after %v; expected about %v", took, wait)
	}
}

// 4. The kernel pings the stack's address. It doesn't know the stack's MAC yet,
// so first it broadcasts an ARP request. Read must return that frame, intact.
func TestReadFrameFromKernel(t *testing.T) {
	needCable(t)
	c := openStack(t)

	// Make the kernel forget the stack's MAC (an earlier test run may have
	// taught it), so it has to ask again.
	if out, err := exec.Command("ip", "-n", netns, "neigh", "flush", "dev", kernelIface).CombinedOutput(); err != nil {
		t.Fatalf("ip neigh flush: %v: %s", err, out)
	}
	ping := inNetns("ping", "-c", "1", "-W", "1", stackIP.String())
	if err := ping.Start(); err != nil {
		t.Fatalf("starting ping in namespace %s: %v", netns, err)
	}
	defer ping.Wait() // no one answers, so ping fails; that's expected

	wantTarget := func(f []byte) bool { return bytes.Equal(f[38:42], stackIP) }
	frame, others := readUntil(t, c, 3*time.Second, nil, func(f []byte) bool {
		return isARP(f, 1) && wantTarget(f)
	})
	if frame == nil {
		t.Fatalf("no ARP request for %v arrived within 3s (read %d other frames)", stackIP, others)
	}

	if len(frame) != 42 {
		t.Errorf("Read returned %d bytes for the kernel's ARP request; the frame is 42 bytes (14 Ethernet + 28 ARP)", len(frame))
	}
	if dst := net.HardwareAddr(frame[0:6]); !bytes.Equal(dst, broadcast) {
		t.Errorf("destination MAC is %v; expected the broadcast address %v", dst, broadcast)
	}
	if src, want := net.HardwareAddr(frame[6:12]), kernelMAC(t); !bytes.Equal(src, want) {
		t.Errorf("source MAC is %v; expected %s's MAC %v", src, kernelIface, want)
	}
}

// 5. The stack asks "who has 10.77.0.1?" through Write. The kernel must accept
// the frame and answer it. Your own request must never come back to Read.
func TestWriteFrameToKernel(t *testing.T) {
	needCable(t)
	c := openStack(t)

	ifi, err := net.InterfaceByName(stackIface)
	if err != nil {
		t.Fatalf("InterfaceByName(%q): %v", stackIface, err)
	}
	request := arpRequest(ifi.HardwareAddr)

	n, err := c.Write(request)
	if err != nil {
		t.Fatalf("Write: %v", err)
	}
	if n != len(request) {
		t.Fatalf("Write reported %d bytes written; the frame is %d bytes", n, len(request))
	}

	ownFrame := func(f []byte) {
		if bytes.Equal(f, request) {
			t.Fatal("Read returned the ARP request you just wrote: Read must only return frames that arrive on the interface")
		}
	}
	reply, others := readUntil(t, c, 3*time.Second, ownFrame, func(f []byte) bool {
		return isARP(f, 2) && bytes.Equal(f[28:32], kernelIP)
	})
	if reply == nil {
		t.Fatalf("the kernel didn't answer the ARP request within 3s (read %d other frames); check with tcpdump on %s whether the frame left", others, kernelIface)
	}

	if dst := net.HardwareAddr(reply[0:6]); !bytes.Equal(dst, ifi.HardwareAddr) {
		t.Errorf("the reply went to %v; expected %s's MAC %v", dst, stackIface, ifi.HardwareAddr)
	}
	if mac, want := net.HardwareAddr(reply[22:28]), kernelMAC(t); !bytes.Equal(mac, want) {
		t.Errorf("the reply says 10.77.0.1 is at %v; expected %s's MAC %v", mac, kernelIface, want)
	}
}

// 6. After Close, Read must fail instead of blocking or returning frames.
func TestReadAfterClose(t *testing.T) {
	needCable(t)
	c, err := link.Open(stackIface)
	if err != nil {
		t.Fatalf("Open(%q): %v", stackIface, err)
	}
	if err := c.Close(); err != nil {
		t.Fatalf("Close: %v", err)
	}

	done := make(chan error, 1)
	go func() {
		_, err := c.Read(make([]byte, frameBuf))
		done <- err
	}()
	select {
	case err := <-done:
		if err == nil {
			t.Fatal("Read after Close returned no error")
		}
	case <-time.After(2 * time.Second):
		t.Fatal("Read after Close is still blocked after 2s; expected an error straight away")
	}
}
