# Notwork

## What it is

The reader builds a network stack by hand, in Go, from Ethernet frames (L2) all the way up to HTTP. The purpose is to get to know networks and how they work by building every layer yourself.

**Done** means the stack is both a client and a server. It fetches a real web page from the internet (DNS, its own TCP, HTTP), and it serves a page that a phone or browser on the LAN can load.

## The reader

Knows Go (structs, slices, errors, goroutines), but not networks: has used the internet, never looked inside a packet.

- **Go isn't a prerequisite.** The reader doesn't need to know Go already, only to be willing to learn it (to run the tests). The book can be followed in another language, but then the tests and the support code (setup script aside) aren't there for them; the intro says so (decided in the writing pass for the intro, 2026-10-20).

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

- **Native Linux only.** WSL2 and containers were considered for the intro's requirements and dropped: WSL2 (NAT) and Docker Desktop sit behind a VM, so the stack's frames may not reach the real LAN (2026-10-20).
- **Linux, AF_PACKET raw sockets.** The stack reads and writes Ethernet frames through an `AF_PACKET` socket ([packet(7)](https://man7.org/linux/man-pages/man7/packet.7.html)). TAP was considered and rejected: its only peer is the host's own kernel ("I thought I talked to the router"), and it can't join a real Wi-Fi LAN (a Wi-Fi client interface can't be bridged).
- **The machine's MAC, its own IP.** The book isn't about building a NIC: the stack sends with the interface's MAC, but uses its own IPv4 address on the LAN, separate from the host's. The kernel drops packets for an IP that isn't its own, so it doesn't reply with RSTs, duplicate pings or port-unreachables.
- **Two places to plug in, same code:**
  - **veth pair (local).** The kernel owns one end with an IP; the stack opens AF_PACKET on the other end. This is deterministic and used by the tests, and it's enough for readers with one machine.
  - **Real interface (`wlan0`/`eth0`).** Used for each chapter's show-off step against real peers: the router, a phone, a second machine.
- **Wi-Fi note for the material (section 00):** the driver converts between Ethernet and 802.11 frames, so what the stack sees is "Ethernet as Linux presents it", even on Wi-Fi.
- **Must work on Wi-Fi.** Wired-only setups are out; they'd exclude Sophia herself.
- **It should work on most networks, not all.** The book doesn't promise every network (corporate port security, 802.1X, ...) will cooperate.
- **Sending onto the real home LAN is fine.** A buggy frame now and then is acceptable; the devices there are built to cope.
- **Kernel interference gets handled by a provided script.** Every known problem (kernel replies, RSTs, offloads, ...) is scouted up front, and readers get a script that turns the needed rules and settings on and off.
  - **One script, `src/scripts/netsetup.sh`** (bash), copied by readers from the 01 chapter (the page `<include>`s the file, so the book never drifts). Not a `just` recipe. Basic use: `sudo ./netsetup.sh setup` and `sudo ./netsetup.sh teardown`; finer-grained: `--probe`, `--status`, `--grant BIN`, `--iface`, `--ip`, `--veth-only` (decided in the 01 writing pass, 2026-10-20).
  - **Probe → JSON.** `--probe` saves what it finds to `/var/lib/notwork/probe.json` (interface, Wi-Fi or wired, SSID, MAC, host IP, network, gateway and its MAC, a free stack IP, ip_forward, offloads, the veth names). `setup` probes again when there's no probe or the network changed (interface, gateway, gateway MAC or SSID differ) or the saved stack IP is taken. What setup changed lives in `/run/notwork/applied.json`, so teardown can undo it. No second device needed: the free-IP check is the host's own ping + `ip neigh`.
  - **Forwarding: a blackhole route for the stack's IP** instead of a firewall drop + `send_redirects=0`: redirects are sent before the FORWARD hook, and the route works the same on nft and iptables systems. The stack's own IP already stops RSTs/duplicate replies; the blackhole stops forwarded copies and redirects. AF_PACKET is unaffected (it taps before IP and sends past netfilter), and so firewalls (ufw, Docker) don't matter.
  - **Test pair:** `nw-kernel` (kernel, `10.77.0.1/24`) and `nw-stack` (the stack, `10.77.0.2`). **The kernel's end lives in its own network namespace, `notwork`**: on the host, desktop services (mDNS/Avahi, KDE Connect, LLMNR, SSDP, Steam) chattered on `nw-kernel` as soon as it had an IP, so the cable wasn't quiet (found in the 01 writing pass, 2026-10-20). The reader's code doesn't change: the stack still opens `nw-stack` in the normal namespace. Kernel-side tools run as `sudo ip netns exec notwork <cmd>`, and so do the tests' kernel-side peers. IPv6 off on both ends, `forwarding=0` and `arp off` on `nw-stack`, offloads off on both, NetworkManager told to leave `nw-stack` unmanaged. The tests rely on these names and addresses.
  - **Offloads** (tx, tso, gso, gro, lro where changeable) off on the real interface, restored from the saved values on teardown.
  - **Privileges:** tests run with `go test -exec sudo ./...`; demo binaries get `cap_net_raw` with `--grant`.

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

- **Book intro** (`content/docs/notwork/index.mdx`): short, memorable, not verbose. **The writing agent drafts the intro and Sophia edits it**; for the chapters it's the opposite (she drafts, the agent gives feedback). Shape: it opens with the context, the journey of this very page load ("when you clicked this page, X, Y, Z happened, and then you got to see it"), then the hook ("ever wondered how all of that works?"), then what you build and done; then *Requirements* (one Linux machine; a network connection, wired or Wi-Fi; a second machine, optional; your phone for the final challenge; no separate *Who it's for*, the hook covers it), *What's in this book* (what each chapter gives you: the idea, what to build, the tests, the show-off, the reference code, challenges and deepenings), *The road* (each chapter with what you can show off at its end), *Not in this book*, *Start here* (00 or 01).

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
- **Language-agnostic black-box tests:** the over-the-cable tests (start the reader's program on `nw-stack`, drive it from the `notwork` namespace with ping, arping, dig, curl, nc) don't care what language the stack is in. With a fixed way to start the program, readers in other languages could run them too. Raised in the 01 writing pass (2026-10-20).
