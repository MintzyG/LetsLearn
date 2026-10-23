// Package link is a raw link on one network interface: whole Ethernet frames
// in and out, as bytes, through a Linux packet socket (packet(7)).
package link

import (
	"encoding/binary"
	"fmt"
	"net"
	"os"
	"time"

	"golang.org/x/sys/unix"
)

// htons turns a 16-bit number from the CPU's byte order into network byte
// order (big-endian), which is what packet(7) wants for protocol numbers.
func htons(v uint16) uint16 {
	var b [2]byte
	binary.BigEndian.PutUint16(b[:], v)
	return binary.NativeEndian.Uint16(b[:])
}

// Conn is a raw link on one interface: an open packet socket, bound to it.
type Conn struct {
	f *os.File // the socket, handed to Go's runtime
}

// Open opens a raw link on the interface named ifname: every EtherType,
// frames from that interface only, outgoing frames ignored.
func Open(ifname string) (*Conn, error) {
	// 0. The kernel knows interfaces by index, not by name: look it up.
	ifi, err := net.InterfaceByName(ifname)
	if err != nil {
		return nil, fmt.Errorf("open %s: %w", ifname, err)
	}

	// 1. A raw packet socket. Protocol 0 means "receive nothing yet", so no
	//    frames from other interfaces sneak in before we bind. SOCK_NONBLOCK
	//    lets Go's runtime wait on it; SOCK_CLOEXEC keeps it out of programs
	//    this one starts.
	fd, err := unix.Socket(unix.AF_PACKET, unix.SOCK_RAW|unix.SOCK_NONBLOCK|unix.SOCK_CLOEXEC, 0)
	if err != nil {
		return nil, fmt.Errorf("open %s: socket: %w", ifi.Name, err)
	}

	// 2. Only hand us the frames that arrive, not the ones that leave
	//    through this interface (ours or the host's).
	err = unix.SetsockoptInt(fd, unix.SOL_PACKET, unix.PACKET_IGNORE_OUTGOING, 1)
	if err != nil {
		unix.Close(fd)
		return nil, fmt.Errorf("open %s: ignore outgoing: %w", ifi.Name, err)
	}

	// 3. Bind to this one interface, and start receiving every EtherType.
	addr := &unix.SockaddrLinklayer{
		Protocol: htons(unix.ETH_P_ALL),
		Ifindex:  ifi.Index,
	}
	if err := unix.Bind(fd, addr); err != nil {
		unix.Close(fd)
		return nil, fmt.Errorf("open %s: bind: %w", ifi.Name, err)
	}

	// 4. Hand the fd to Go. Because it's non-blocking, the *os.File is
	//    "pollable": Read and Write wait in the runtime instead of blocking
	//    a thread, and read deadlines work.
	f := os.NewFile(uintptr(fd), "packet:"+ifi.Name)
	return &Conn{f: f}, nil
}

// Read waits for the next frame that arrives and copies it into b. Each call
// returns one whole frame; a frame longer than b is cut to len(b).
func (c *Conn) Read(b []byte) (n int, err error) {
	return c.f.Read(b)
}

// Write sends frame, unchanged, as one frame. It must start with the
// Ethernet header; the card adds the FCS.
func (c *Conn) Write(frame []byte) (n int, err error) {
	return c.f.Write(frame)
}

// SetReadDeadline makes a Read that is waiting at t, or called after it,
// fail with os.ErrDeadlineExceeded. The zero time means no deadline.
func (c *Conn) SetReadDeadline(t time.Time) error {
	return c.f.SetReadDeadline(t)
}

// Close closes the socket. A Read waiting in another goroutine returns
// with an error.
func (c *Conn) Close() error {
	return c.f.Close()
}