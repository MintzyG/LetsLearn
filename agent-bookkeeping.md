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
| 00 | Foundations | – | – | – | – | – |

## Log

<!-- entries go below -->

### notwork / project-file — Interview — 2026-10-20
- **Did:** interviewed Sophia and wrote `projects/notwork/notwork.md` (approved); created the book root `content/docs/notwork/` with `just new notwork "Notwork"`.
- **Refinements:** link mechanism discussed at length: TAP rejected (its only peer is the host's own kernel; it can't join a Wi-Fi LAN), TUN rejected (drops Ethernet/ARP). Chosen: AF_PACKET with the machine's MAC and the stack's own IP, a veth pair locally, the real interface for show-offs, and a setup script for kernel interference and offloads. IPv4 and ICMP are separate sections.
- **Open:** what 01 Setup gives the reader to show off (decide when 01 comes up); the setup script isn't written yet; an L1 acoustic modem is in the Later list, for after the book.
- **Signed off:** interview agent, after Sophia said done
