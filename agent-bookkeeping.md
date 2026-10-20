# Agent Bookkeeping

The log of the loop (see `loop.md`), shared by all projects. Each agent appends an entry when Sophia says its step is done. Newest at the bottom. Never edit someone else's entry.

## Entry format

```
### <project> / NN-slug — <Writer | Verification | Implementation | Writing> — YYYY-MM-DD
- **Did:** what you produced or changed (files)
- **Refinements:** where Sophia got stuck and what changed in material/tests (corrections she approved, feedback given, or how the chapter was helped)
- **Open:** anything left unresolved or deferred to a later section
- **Signed off:** <role> agent, after Sophia said done
```

## Status

One table per project. The first agent to work on a project adds its table; each agent updates its own cell on sign-off (`–` not started, `wip`, `done`).

<!--
### <project>
| NN | Section | Writer | Sophia | Verification | Implementation | Writing |
|---|---|---|---|---|---|---|
-->

### notwork
| NN | Section | Writer | Sophia | Verification | Implementation | Writing |
|---|---|---|---|---|---|---|
| intro | Book intro | – | – | – | – | done |
| 00 | Foundations | wip | – | done | – | – |

## Log

<!-- entries go below -->

### notwork / project-file — Interview — 2026-10-20
- **Did:** interviewed Sophia and wrote `projects/notwork/notwork.md` (approved); created the book root `content/docs/notwork/` with `just new notwork "Notwork"`.
- **Refinements:** link mechanism discussed at length: TAP rejected (its only peer is the host's own kernel; it can't join a Wi-Fi LAN), TUN rejected (drops Ethernet/ARP). Chosen: AF_PACKET with the machine's MAC and the stack's own IP, a veth pair locally, the real interface for show-offs, and a setup script for kernel interference and offloads. IPv4 and ICMP are separate sections.
- **Open:** what 01 Setup gives the reader to show off (decide when 01 comes up); the setup script isn't written yet; an L1 acoustic modem is in the Later list, for after the book.
- **Signed off:** interview agent, after Sophia said done

### notwork / 00-foundations — Verification — 2026-10-20
- **Did:** worked through the four 00 `STUCK.md` entries with Sophia, one correction at a time; edited `projects/notwork/material/00-foundations/material.html`, filled in every entry's Material fix, and added a "Self-checks" rule to `projects/notwork/notwork.md`.
- **Refinements:** her slips (no fix): 1.3/1.4, `ip addr` vs `ip route`, `-x` vs `-e`. Book fixes: "private doesn't mean local" sentence (2.2b); 2.3 now asks for both halves it grades; byte order is layout, not value (3.1a), answered in hex; the toy HdrLen's unit is now stated in the main text, and 3.3 has its own numbers (the visual's popup showed the old answer); offset vs. length line (her 15 was an off-by-one); 3.4 names which checksum; `-i` taught for tcpdump (4.1c); 4.2 split into 2a/2b. New book-wide rule: no mental hex↔decimal conversions in self-checks.
- **Open:** self-checks 2 and 3 haven't been passed yet (both reworded); no implementation pass for 00, so the writing pass is next.
- **Signed off:** verification agent, after Sophia said done

### notwork / intro — Writing — 2026-10-20
- **Did:** drafted the book intro `content/docs/notwork/index.mdx` at Sophia's request (she has trouble writing intros; she edited it). Filled `content/docs/notwork/meta.json`'s description. Recorded in `projects/notwork/notwork.md`: the intro's shape, that the writing agent drafts the intro and she drafts the chapters, Go isn't a prerequisite (other languages work, without tests), and native Linux only.
- **Refinements:** opening reworked to the journey of this page load, then the hook ("Ever wondered how all of that works?"); the history section dropped; "Who it's for" replaced by "Requirements"; "How chapters work" became "What's in this book"; WSL2 and containers dropped (the stack's frames may not reach the real LAN behind a VM).
- **Open:** "Your phone, for the final challenge" vs. the road map, which uses the phone in 05, 07 and HTTP; 01 Setup's show-off in the road table is a placeholder until 01 is planned; the Start here cards link to `/docs/notwork/00-foundations` and `/docs/notwork/01-setup`, which don't exist yet.
- **Signed off:** writing agent, after Sophia said done
