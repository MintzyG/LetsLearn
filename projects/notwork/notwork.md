# Project: Notwork

Project file for the Notwork book. Read `loop.md` first; it defines the workflow. This file holds what is specific to Notwork and overrides `loop.md` where they conflict.

---

## What it is

The reader builds a network stack in **Go** from the bottom up: raw Ethernet frames, ARP, IPv4, ICMP, UDP, DNS, DHCP, TCP, and onward. It does not use the kernel's networking for the layers being built. Frames go out through `AF_PACKET` raw sockets (via `golang.org/x/sys/unix`, not `net`).

## Scope

- The goal is a stack that **works on the live web along the happy path**: real routers, real DNS servers, real web servers. It does not need to handle every device or every RFC corner. Nobody is reimplementing 60 years of networking.
- **Linux only.**
- **Assume the reader has one machine.** Every section must be completable on a single Linux box: real NIC to router/internet, plus veth pairs or network namespaces when two endpoints are needed. When it makes sense, also provide an **optional two-device test** that runs the *same codebase* on two Linux machines on the same LAN.
- **Sources**: Wikipedia, the relevant RFCs, and man pages (`packet(7)`, `ip(8)`, `ip-netns(8)`, ...).

## Default oracles

See "Oracles" in `loop.md`. Notwork's defaults:

- **Real world** (primary): real routers, DNS servers and web servers, reached as early as possible in each section.
- **Golden data**: real captured packets as fixtures, so tests stay reproducible when the live network changes.
- **Interop**: real tools that consume or confirm your stack's output, e.g. `ip neigh` (ARP), a real host answering ping (ICMP), `net.LookupHost` (DNS), and stdlib `http.ReadResponse` reading off your TCP connection (`net.Conn`).

Reference swap doesn't fit well here: too many layers have no standard interface to swap against.

## Code conventions

- Go tests go in the package directories (`<pkg>/*_test.go`), with fixtures in `<pkg>/testdata/` (real captured packets; note where each was captured).
- Live/real-world checks need privileges and a network, so put them in a `cmd/` program or a test gated by a flag or env var.
- Stubs use `panic("TODO")` bodies.

## Known real-world gotchas (from the first version of this project)

- **Kernel RSTs**: `AF_PACKET` sees packets, but so does the kernel. For a TCP port with no kernel socket, the kernel replies with an RST and kills your connection. Fix this by running inside a dedicated **network namespace** with an RST-drop rule set up once, rather than ad-hoc iptables rules on the host.
- **GRO**: real NICs coalesce TCP segments (Generic Receive Offload), so large segments arrive with checksums that look invalid from userspace. Use `ethtool -K <iface> gro off` (veth is unaffected).
- **`go run` inside a netns** hit a cgroup issue. Build the binary first and run it in the namespace.
- **Raw sockets need privileges**: `sudo` or `CAP_NET_RAW`/`CAP_NET_ADMIN` on the built binary (`setcap`).

## Sections (proposed: confirm with Sophia before relying on this)

| NN | Section | Earliest real-world win |
|---|---|---|
| 00 | Setup & environment | netns/veth script works, raw socket opens |
| 01 | Ethernet & raw sockets | parse real frames off your own NIC |
| 02 | ARP | resolve your real router's MAC; compare with `ip neigh` |
| 03 | IPv4 | send/parse IPv4 packets to/from the real network |
| 04 | ICMP | ping a real host (e.g. 1.1.1.1) |
| 05 | UDP | exchange datagrams with a real host |
| 06 | DNS | resolve a real name; compare with `net.LookupHost` |
| 07 | DHCP | get a lease from the real router (inside a netns) |
| 08 | TCP handshake | handshake with a real server |
| 09 | TCP data | fetch a real web page |
| 10 | TCP close | clean teardown with a real server |
| 11 | TCP retransmission | survive induced packet loss |
| 12 | `net.Conn` | stdlib `http.ReadResponse` reads off your TCP |
| 13 | Congestion control (Tahoe) | cwnd ramp visible against a real server |
| 14+ | HTTP, WebSockets | TBD |

## Old version

The old repo at `~/Redes` (`issues.md`, `Notwork.md`, the old Go packages) is **context only**. The book is being redone from scratch in this format, so don't adapt or copy the old chapters.
