# Notwork

## What it is

The reader builds a network stack by hand, in Go, from Ethernet frames (L2) all the way up to HTTP. The purpose is to get to know networks and how they work by building every layer yourself.

**Done** means the stack is both a client and a server. It fetches a real web page from the internet (DNS, its own TCP, HTTP), and it serves a page that a phone or browser on the LAN can load.

## The reader

Knows Go (structs, slices, errors, goroutines), but not networks: has used the internet, never looked inside a packet.

## How it progresses

- **Bottom up, one protocol at a time.** Each section adds the next protocol on top of the ones before it.
- **Section size: one protocol per section, big ones split.** A big protocol (TCP especially) spans several sections, and each of them still ends in something that works.
- **Every chapter stands on its own.** A reader who stops at the end of any chapter has something real that works and that they can show off.

## Scope

The main path covers Ethernet, ARP, IPv4, ICMP, UDP, DNS, TCP and HTTP, plus:

- **Routing / default gateway**: same subnet vs. via the gateway, which is what makes the internet reachable.
- **DHCP client**: the stack asks the router for its own address. Because the stack shares the host's MAC, the router may hand back the host's own lease; the stack checks the address it gets, and if it's the machine's own IP, switches it for a different one.

Not on the main path (for now): IPv6, TLS/HTTPS.

## Platform and environment

- **Linux, AF_PACKET raw sockets.** The stack reads and writes Ethernet frames through an `AF_PACKET` socket ([packet(7)](https://man7.org/linux/man-pages/man7/packet.7.html)). TAP was considered and rejected: its only peer is the host's own kernel ("I thought I talked to the router"), and it can't join a real Wi-Fi LAN (a Wi-Fi client interface can't be bridged).
- **The machine's MAC, its own IP.** The book isn't about building a NIC: the stack sends with the interface's MAC, but uses its own IPv4 address on the LAN, separate from the host's. The kernel drops packets for an IP that isn't its own, so it doesn't reply with RSTs, duplicate pings or port-unreachables.
- **Two places to plug in, same code:**
  - **veth pair (local).** The kernel owns one end with an IP; the stack opens AF_PACKET on the other end. This is deterministic and used by the tests, and it's enough for readers with one machine.
  - **Real interface (`wlan0`/`eth0`).** Used for each chapter's show-off step against real peers: the router, a phone, a second machine.
- **Wi-Fi note for the material (section 00):** the driver converts between Ethernet and 802.11 frames, so what the stack sees is "Ethernet as Linux presents it", even on Wi-Fi.
- **Must work on Wi-Fi.** Wired-only setups are out; they'd exclude Sophia herself.
- **It should work on most networks, not all.** The book doesn't promise every network (corporate port security, 802.1X, ...) will cooperate.
- **Sending onto the real home LAN is fine.** A buggy frame now and then is acceptable; the devices there are built to cope.
- **Kernel interference gets handled by a provided script.** Every known problem (kernel replies, RSTs, offloads, ...) is scouted up front, and readers get a script that turns the needed rules and settings on and off. It covers at least: creating and removing the veth pair; dropping the stack's IP in the forward chain and turning off ICMP redirects (Docker turns on IP forwarding); turning off offloads (GRO, checksum offload, TSO/GSO) with `ethtool -K` and restoring them on `down`; choosing an IP outside the router's DHCP range and checking it's free; granting `cap_net_raw`.

## Default oracles

- **Real world**: the router, a phone, real DNS servers and real web servers answer the stack.
- **Interop with the kernel**: over the veth pair, Linux's own tools (ping, arping, dig, curl, nc, ...) talk to the stack and must accept it.
- **Golden data**: captured frames (pcap) as test fixtures.
- **Two copies of your own stack talking**: with two machines, one copy on each, over the real LAN; with one machine, two copies over the veth pair.

## Visuals

- **Output visuals:** none for now; tcpdump/Wireshark show the traffic.
- **Explanatory visuals:** only where a concept is hard to grasp from text (header layouts, the ARP exchange, the TCP handshake and state machine, the sliding window, ...).
- **Presentation visuals:** maybe later; no videos planned now.

## Self-checks

- **No mental base conversions.** A self-check never makes the reader convert between hex and decimal in their head. Questions say which base to answer in, and hex answers are accepted as they are (decided in the 00 verification pass).

## Challenges & deepenings

Each section ends with optional challenges (things to build with what the reader now knows) and deepenings (further into the section's topic). They're described, never solved, and **each one ships with its own tests**. They never reach ahead.

## Code conventions

- `src/` is **one Go module**, with **one package per protocol** (`ethernet/`, `arp/`, `ipv4/`, ...).
- Each package holds its own `_test.go` files, with fixtures in its `testdata/`.
- The demo programs each chapter shows off live in `cmd/`.

## Sources

- **RFCs and IEEE specs**: IEEE 802.3, RFC 826 (ARP), 791 (IPv4), 792 (ICMP), 768 (UDP), 2131 (DHCP), 1034/1035 (DNS), 9293 (TCP), 9110/9112 (HTTP).
- **Linux man pages and kernel docs**: packet(7), ip(8), veth(4), ethtool(8), the kernel networking docs.
- **Wikipedia**, for overviews.

## Known gotchas

Scouted up front; the setup script handles what it can, and the material explains the rest where it first bites.

- **IP forwarding** (Docker turns it on): the kernel forwards packets for the stack's IP back out and sends ICMP redirects.
- **Offloads** (GRO, checksum offload, TSO/GSO): merged "giant" segments and "bad" checksums in what the stack sees. Turned off on the interface while working.
- **Same MAC as the host**: a DHCP server may hand the stack the host's own lease (see Scope).
- **Wi-Fi is not Ethernet**: the driver translates frames to and from 802.11.
- **LAN noise** (IPv6, mDNS, broadcasts): frames the stack doesn't understand yet; it must ignore them.
- **Privileges**: AF_PACKET needs `cap_net_raw`.

## Section map

Fading detail: only the section being worked on is planned in depth, when work reaches it.

- **00 Foundations** (reading only, skippable): layers and encapsulation; addresses and links (MAC vs IP vs port, local network vs internet, what a router/switch/AP does, Wi-Fi presented as Ethernet); packets on the wire (bytes, network byte order, reading RFC header diagrams, checksums in general); the tools (tcpdump/Wireshark, ip, ethtool). Setup is *not* here.
  - **Size:** medium read, ~1 hour. Four parts, each with a short self-check.
  - **Pure reading:** no hands-on commands. The tools are introduced (what each is for), not used; first use is in 01.
  - **Explanatory visuals:** encapsulation (one request wrapped layer by layer, and unwrapped on the other side); the path across networks (MACs change at every hop, IPs stay the same); reading an RFC header diagram (field ↔ bytes, with byte order). The header visual uses a **made-up toy header**, clearly labeled as made up. It has every feature needed to read real diagrams (4-bit fields, flags, 16- and 32-bit fields, a checksum, options and padding) and doesn't reach ahead. A real capture was considered and dropped: it has too many complex fields. The other two visuals are schematic, with documentation addresses (RFC 5737, RFC 7042).
  - **Achievement:** the reader can read an RFC header diagram, knows which address does what job, and knows what each tool is for.
  - **Oracles:** none (no code); the self-checks are the only signal.
- **01 Setup**: its own section: the veth pair, the setup script, privileges, AF_PACKET. What it gives the reader to show off is decided when 01 comes up.
- **02 Ethernet**: a frame sniffer on the real interface.
- **03 ARP**: the router learns your MAC.
- **04 IPv4**: two copies of your stack exchange IPv4 packets, and the sniffer decodes IP.
- **05 ICMP**: your stack answers pings (from the phone, from the kernel).
- **06 Routing / default gateway**: ping 8.8.8.8 through the gateway.
- **07 UDP**: `nc` from the phone reaches your echo service.
- **08 DHCP**: your own lease from the router.
- **09 DNS**: your own `dig`.
- **Part TCP** (several sections).
- **Part HTTP**: a client that fetches a real page, and a server a browser on the LAN loads.

## Later

- **After the book is finished, maybe:** an optional L1 (an acoustic modem, bits as sound from speaker to mic), possibly with a sound-to-network bridge so real peers sit on the other end, and a per-chapter challenge to run that chapter's demo over sound. Dropped from the book for now.
