# Project: Notwork

Project file for the Notwork book. Read `loop.md` first; it defines the workflow. This file holds everything specific to Notwork and overrides `loop.md` where they conflict.

This file came out of the "Starting a new project" interview in `loop.md`. It is the **example project file**: use its shape when drafting one for a new project.

---

## What it is

The reader builds a **network stack in Go**, from raw Ethernet frames up to WebSockets. The layers being built don't use the kernel's networking: frames go out through `AF_PACKET` raw sockets (via `golang.org/x/sys/unix`, not `net`).

**Done** for the whole book: talking to real servers on the internet through a stack the reader wrote, from fetching web pages over their own TCP to holding a WebSocket conversation.

## The reader

Interested in networking, wants to dive in, and isn't afraid to pick up a language along the way. Nobody builds TCP from scratch without being at least a little comfortable programming, so prior Go knowledge is not assumed or required.

**Why Go:** it is network-focused, with byte slices, `encoding/binary` and good syscall access, and its standard library has real implementations to compare against (`net`, `net/http`, `crypto/tls`). In a language like C, much of the code would be about memory management instead of networking. The material should briefly explain Go features as they come up, without becoming a Go tutorial.

## How it progresses

- **Bottom-up, one layer at a time.** Each section builds one protocol on top of the layers built before it.
- **One protocol per section.** TCP is the exception and gets several sections, because it is several problems: handshake, data, close, retransmission, congestion control, and the `net.Conn` interface.
- **Every section ends in a standalone achievement.** A reader who stops partway still built something real that works on the real network. After Ethernet they have their own packet sniffer; after ICMP, their own ping; after DNS, their own `dig`. Each section's achievement is in the table below.
- **Real world as early as possible within each section.** Use a veth pair or network namespace only when the section really needs two endpoints or protection from the kernel (e.g. TCP).

## Scope

- The stack **works on the live web along the happy path**: real routers, real DNS servers, real web servers. It doesn't handle every device or every RFC corner case. Nobody is reimplementing 60 years of networking.
- **IPv4 only.** IPv6 is out of scope.
- **IPv4 fragment reassembly is optional** (section 05), since TCP avoids fragmentation.
- **TLS is not built.** stdlib `crypto/tls` runs on top of the reader's own TCP (via `net.Conn`), which is how the book reaches real HTTPS and `wss://` servers.
- Each section lists what it skips, with one sentence on why real stacks need it.

## Platform and environment

- **Go, Linux only.**
- **Assume one machine.** Every section must be completable on a single Linux box: real NIC to router/internet, plus veth pairs or network namespaces when two endpoints are needed. When it makes sense, also provide an **optional two-device test** that runs the same code on two Linux machines on the same LAN.
- Raw sockets need privileges: `sudo`, or `CAP_NET_RAW`/`CAP_NET_ADMIN` on the built binary (`setcap`).
- Environment setup (netns script, capabilities, GRO) is introduced in the first section that needs each piece, not as a section of its own.

## Default oracles

See "Oracles" in `loop.md`. Notwork's defaults:

- **Real world** (primary): real routers, DNS servers and web servers, reached as early as possible in each section.
- **Golden data**: real captured packets as fixtures, so tests stay reproducible when the live network changes.
- **Interop**: real tools and libraries that confirm or consume the stack's output: `ip neigh` (ARP), the system `ping` and `tcpdump`/Wireshark (any section), `net.LookupHost` (DNS), stdlib `net/http` and `crypto/tls` running over the reader's TCP (`net.Conn`).

Reference swap doesn't fit well here: most layers have no standard interface to swap against.

## Visuals

All three kinds (see "Visualization" in `loop.md`):

- **Output visuals**, built by the reader as part of the project:
  - a hex dump of frames with fields highlighted (Ethernet onward)
  - a timeline of a TCP conversation, with each segment and its flags (TCP sections)
  - a log of TCP state transitions
  - a congestion window graph showing the Tahoe sawtooth (section 13)
- **Explanatory visuals** (agents may build Sophia's learning versions): header layout diagrams, sequence diagrams of exchanges (ARP, DHCP's DORA, the TCP handshake and teardown), and the TCP state machine.
- **Presentation visuals**: Sophia plans videos about the material.

## Code conventions

- All code lives in `projects/notwork/src/`, as one Go module.
- One package per protocol (`ethernet`, `arp`, `ipv4`, ...), with each section's runnable demo in `cmd/`.
- Tests sit next to their package (`<pkg>/*_test.go`). Fixtures go in `<pkg>/testdata/`: real captured packets, each with a note on where and how it was captured.
- Live and real-world checks need privileges and a network, so they go in the `cmd/` demo or a test gated by a flag or env var.
- Stubs use `panic("TODO")` bodies.

## Sources

Wikipedia for the overview, the relevant **RFCs** as the authority, and Linux **man pages** for the system side (`packet(7)`, `raw(7)`, `ip(8)`, `ip-netns(8)`, `ethtool(8)`, ...).

## Known real-world gotchas (from the first version of this project)

- **Kernel RSTs**: `AF_PACKET` sees packets, but so does the kernel. For a TCP port with no kernel socket, the kernel replies with an RST and kills your connection. Fix this by running inside a dedicated **network namespace** with an RST-drop rule set up once, rather than ad-hoc iptables rules on the host.
- **GRO**: real NICs coalesce TCP segments (Generic Receive Offload), so large segments arrive with checksums that look invalid from userspace. Use `ethtool -K <iface> gro off` (veth is unaffected).
- **`go run` inside a netns** hit a cgroup issue. Build the binary first and run it in the namespace.

## Sections

Each section is one protocol and ends in a standalone achievement against the real network.

| NN | Section | Achievement (what the reader has at the end) |
|---|---|---|
| 01 | Ethernet & raw sockets | **Your own packet sniffer**: real frames from your NIC, decoded and hex-dumped |
| 02 | ARP | **Find any device's MAC address** on your network; matches `ip neigh` |
| 03 | IPv4 | **A traffic monitor**: see which hosts your machine talks to, decoded from real packets; send valid IPv4 packets |
| 04 | ICMP | **Your own ping**: ping a real host on the internet (e.g. 1.1.1.1) |
| 05 | IPv4 fragmentation *(optional)* | **Big pings**: reassemble real fragmented replies (`ping -s 4000`-sized) |
| 06 | UDP | **Ask a real time server for the time** (NTP) over your own UDP |
| 07 | DNS | **Your own `dig`**: resolve real names; matches `net.LookupHost` |
| 08 | DHCP | **Your stack configures itself**: get a real lease from your router (in a netns) |
| 09 | TCP handshake | **A real server accepts your connection** |
| 10 | TCP data | **Fetch a real web page** over your own TCP |
| 11 | TCP close | **Clean teardown** with a real server; every state transition logged |
| 12 | TCP retransmission | **Survive packet loss**: a transfer completes while packets are being dropped |
| 13 | Congestion control (Tahoe) | **Watch the sawtooth**: graph your congestion window during a large real download |
| 14 | `net.Conn` | **stdlib on your stack**: `net/http` and `crypto/tls` fetch a real HTTPS page over your TCP |
| 15 | HTTP/1.1 client | **Your own HTTP client**: headers, status codes and chunked encoding against real servers |
| 16 | WebSockets | **Talk to a real WebSocket server** (`wss://`, via `crypto/tls` on your stack) |

## Old version

The old repo at `~/Redes` (`issues.md`, `Notwork.md`, the old Go packages) is **context only**. The book is being redone from scratch in this format, so don't adapt or copy the old chapters.
