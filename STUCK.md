# Stuck Log

Every time Sophia gets stuck, the agent working with her adds an entry here (see `loop.md`, step 2). Shared by all projects. Newest at the bottom.

These entries are some of the most valuable data the loop produces: they show where the material failed, and they become the best hints in the book. The verification agent works through them with Sophia to refine the material, and the writing agent checks that her chapter covers them.

## Entry format

```
### <project> / NN-slug — YYYY-MM-DD
- **Stuck on:** what confused her, in her words when possible
- **Where:** material section, test name, or concept
- **Nudges:** each hint given, in order, and which one worked
- **Material fix:** what the writer changed (filled in during refine; "none needed" is a valid answer, with a reason)
```

Log it as it happens, not afterwards from memory. Don't record the answer itself, only what confused her and what nudge helped.

## Log

<!-- entries go below -->

### notwork / 00-foundations — 2026-10-20
<!-- auto-check: notwork/00-foundations/1-layers-and-encapsulation/2026-10-20 -->
- **Stuck on:** She puts the FCS/L1 on the kernel's side instead of the driver and NIC (which stay below Notwork), and in 3) she doesn't name that TCP relies only on IP's service, not on the link.
- **Where:** self-check of "1. Layers and encapsulation" (material)
- **Nudges:** from the automatic answer check
  1. 1) and 2) are right on target. For 3), you're circling the idea, but check whose point of view it is: which service does TCP actually depend on, and what does it never see of what's underneath? For 4), L2 onwards is right, but look again at who handles the FCS and L1 — is it the kernel, or something else? Re-read "Where Notwork sits".
  2. 1, 2 and 4 are right: your header order is correct, EtherType is the field, and you split L2 and up from L1 plus the trailer well. Question 3 is the one to rework. You list Ethernet and the network card as things TCP depends on, but TCP sits above IP. Which layer does TCP actually use, and does it ever see anything below that? Re-read the "Why layers" paragraph about what each layer relies on.
- **Material fix:** none needed. "Why layers" says plainly that TCP only needs IP's service, and "Where Notwork sits" says the driver and card handle L1 and the trailer. Both slips were hers (verification pass, 2026-10-20).

### notwork / 00-foundations — 2026-10-20
<!-- auto-check: notwork/00-foundations/2-addresses-and-links/2026-10-20 -->
- **Stuck on:** She mixes up private-range membership with being on the local link (the /24 prefix alone decides that), and she doesn't say why MACs only have local meaning or that the destination IP stays fixed end to end.
- **Where:** self-check of "2. Addresses and links" (material)
- **Nudges:** from the automatic answer check
  1. 1a–1c, 2a and 4 are on target. For 2b, "not local" and "send it to the router" are right. But check your reason: does being outside the private range have anything to do with whether an address is on your link? Also, whose MAC is on that frame, and what's the destination IP inside it? For 3, you picked the right one and the "re-wrapping at each hop" idea is good. Add why a MAC can't stay the same the whole way, and what that means for the IP.
- **Material fix:** (verification pass, 2026-10-20) 2b: added a sentence after the private ranges in "Three addresses, three jobs": private doesn't mean local, only the prefix decides (example with numbers different from 2b). 3: the question graded more than it asked, so it now asks why one address changes *and* why the other can stay the same.

### notwork / 00-foundations — 2026-10-20
<!-- auto-check: notwork/00-foundations/3-packets-on-the-wire/2026-10-20 -->
- **Stuck on:** She mixes up the value of a field in network byte order (big-endian, as written) with what a little-endian CPU misreads, and she doesn't apply HdrLen's unit of 32-bit words when converting to bytes.
- **Where:** self-check of "3. Packets on the wire" (material)
- **Nudges:** from the automatic answer check
  1. Your 1b is right, and 2 is right too (first byte, second half). In 4, you're right that anyone who can change the data can recompute the checksum. The drop part is also there, but "before software sees it" describes the Ethernet card's check. Ask yourself which layer's checksum the question means. 1a: the question asks what the bytes mean under the protocol's convention, not what your CPU gives you. Does reading them in the CPU's order give the same number? 3: recheck how HdrLen is counted. What unit does it use, and what does the section say about options and alignment? Then redo the payload subtraction.
- **Material fix:** (verification pass, 2026-10-20) 1a: added a paragraph to "Network byte order": byte order is about the layout of the bytes, never the value. The question now says to answer in hex, and the reference answers don't require decimal (new book-wide rule in the project file: no mental base conversions). 3: the toy header's HdrLen unit was only in the visual's popup, which also showed the answer for the question's numbers. The unit is now stated in the main text, and the question has its own numbers (6 and 100). Her 15 was an off-by-one (last offset taken as the length), so "A packet is a byte slice" now says a header's length is the payload's offset. 4: the question was ambiguous (her FCS reading was valid). It now names a header checksum her code checks, not the FCS.

### notwork / 00-foundations — 2026-10-20
<!-- auto-check: notwork/00-foundations/4-the-tools/2026-10-20 -->
- **Stuck on:** She mixes up which ip subcommand shows the default gateway (routes, not addresses), and which tcpdump flag shows MAC addresses (-e for the Ethernet header, not -x for raw hex bytes).
- **Where:** self-check of "4. The tools" (material)
- **Nudges:** from the automatic answer check
  1. 1b, 1d and 2 are right: you named the tool and the idea. For 2, the card fills the checksum in after the capture has already seen the frame. For 1a, ip addr lists addresses on each interface, but is the gateway an address of your interface? Check the ip table for which subcommand shows routes. For 1c, -x is about raw bytes; which flag adds the Ethernet header with MACs, and how do you pick wlan0?
  2. 1b, 1c, 1d and 2 are right. In 2, you also saw why the capture shows the wrong value: it taps the frame before the card fills the checksum in. For 1a, ip is the right tool, but ip addr isn't the right subcommand. Check the table of ip subcommands. Which one shows the routing table? The default gateway is part of that. Also, in 1c, remember which interface you want to watch.
  3. 1a, 1b and 1d are right. In 1c you have the right tool and the -e flag, but you left out which interface to watch. Check how the section's example names it, and what flag tells tcpdump where to listen. In 2 you correctly say the card fills in the checksums. You haven't yet explained why tcpdump shows them as wrong. Where does the capture tap the frame, compared with where the card does its work?
  → answered correctly on try 4
- **Material fix:** (verification pass, 2026-10-20) 1a and the -x/-e mix-up in 1c were her slips; the ip table and the tcpdump bullets are clear. 1c: the checker wanted `-i wlan0`, which the material never taught, so `-i` is now a tcpdump bullet. 2: "What's going on?" was graded as two parts, so the question is now split into 2a (who fills in the checksums) and 2b (why tcpdump sees them as wrong).

### notwork / 01-setup — 2026-10-20
<!-- auto-check: notwork/01-setup/2-opening-the-socket/2026-10-20 -->
- **Stuck on:** She sees that protocol 0 stops early frames but doesn't say they would come from other interfaces, because the socket isn't yet bound to a single interface.
- **Where:** self-check of "2. Opening the socket" (material)
- **Nudges:** from the automatic answer check
  1. 1) and 3) are right. 4) is right too: you named both the polling and the deadlines. For 2), you've got the "sneaking in" part, but think about when it happens. With ETH_P_ALL at socket time, the socket starts receiving immediately, and the bind comes later. Where would those early frames come from, since the bind hasn't chosen an interface yet? Re-read step 1 and the packet(7) quote.
  → answered correctly on try 2
- **Material fix:** none needed (verification pass, 2026-10-20). Both the explanation of step 1 and the code's comment say the socket would receive from every interface until the bind, so it was her slip, and she got it on try 2.

### notwork / 01-setup — 2026-10-20
<!-- impl-check: notwork/01-setup/4-task/2026-10-20 -->
- **Stuck on:** She feels this section expects her to write socket code without having been taught basic networking, and she doesn't know where to start with Conn and Open.
- **Where:** implementation check of "4. Task" (material)
- **Nudges:** from the automatic implementation check and help button
  1. (help) asked "Look this section is about sockets and expecting me to implement it on my own? when the book is for people who dont know basic networking, this is a severe lapse in the writer's agent judgement": Fair point, I'll flag to the author that sockets are a big jump here. You're not starting from zero, since Open wraps your section 2 code: what does that code do, and which parts of it would a Conn need to keep?
- **Material fix:** (verification pass, 2026-10-20) the material was at fault. The snippet used `ifi` without showing where it came from and stopped before `Open` returned, and what was left (Conn and the four methods) was Go plumbing around an `*os.File`, not networking, for readers who don't need to know Go. Section 2 is now "The link package": the whole `link.go` (lookup, Conn, Open, the four methods) shown and explained. The reader types it in and runs the tests, and only the demo `cmd/raw` is theirs (the implementation check now points at it). The deepening (recvfrom/RawConn) was dropped as socket internals, along with `deepening_test.go`. Decision recorded in the project file.

### notwork / 01-setup — 2026-10-20
- **Stuck on:** Section 3 was unreadable: its `link` spec only repeated section 2 (once the package was shown), and the demo spec (`raw -i IFACE`, `-send TEXT`) meant nothing to her. Making readers who aren't confident in Go parse command-line flags was too much.
- **Where:** "3. Spec" (material), raised in conversation during the verification pass
- **Nudges:** none (a material problem, not hers)
- **Material fix:** (verification pass, 2026-10-20) section 3 is now "The demo: `cmd/raw`", only the demo, in plain words: where the file lives, then what the program does in order (two constants for interface and text, find your MAC, open, build and send one frame (a byte table: to, from, kind, message), then hex-dump every arriving frame, with a sample of the output). No flags. The show-off in section 5 and the project file follow it.
