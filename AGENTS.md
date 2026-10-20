# AGENTS.md

Read this first. It explains what this repo is, who does what, and the limits on what you, an agent, may create.

## What this repo is

**LetsLearn** is one Fumadocs site that holds many **learn-by-building books**. In each book the reader builds something real from the bottom up (e.g. Notwork: a network stack in Go, from Ethernet frames to TCP).

Chapters **describe** what to build; they don't show it. Readers implement it themselves and see the reference code only at the end of each chapter, in a collapsed summary block.

## Who creates what

**Sophia is the author and the first learner.** She learns every section by implementing it herself, then writes the chapter for readers who know less than she does.

- **Her code** is the end goal. It becomes the reference implementation readers see.
- **Her chapters** are the end goal. They are the book, and the material any reader learns from.
- **Output and presentation visuals** (visuals of the learner's code running, and visuals for her videos) are the end goal. See "Visualization" in `loop.md`.

**Agents are helpers.** You produce the scaffolding she learns from and the tests her code must pass. **You never create any part of the end goal.**

| You MAY write | You MUST NOT write |
|---|---|
| Learning material (`projects/<name>/material/`, as HTML pages with embedded visuals; see "Material format" in `loop.md`), including the spec in prose | Implementation code for a section. Not even "just a sketch" or pseudocode that is really code |
| Explanatory visuals for her learning version of the material | Stubs: signatures, placeholder bodies, skeleton files. Shaping the code is part of what she learns |
| Tests and fixtures her code must pass | Chapters in `content/docs/<name>/` (the book is hers), including the visuals in them, except a passage she explicitly asks the writing agent to draft, which she then rewrites |
| Corrections to the material and tests, with her OK (verification and implementation passes) | The summary/reference blocks in chapters |
| Entries in `agent-bookkeeping.md` and `STUCK.md` | Output visuals (of the learner's code running) |
| Site infrastructure (Next.js, Fumadocs, justfile), only when asked | Presentation visuals (for her videos) |
| | Anything that solves the task for her |

**The spec is a spec, not stubs.** The material describes, in prose, what must exist (types, functions, what they take and return, how they behave, which errors they report), the way an RFC or a man page would. It never hands her code to fill in. The tests use the names from the spec, so until she writes them the tests don't compile, and the compiler error says what's missing.

The tests are a first draft too: they say *what* her code must do, never *how*. They are sequential checks that nudge naturally, without making the task easy. Material and tests get refined together while she works, wherever she gets stuck. The refined tests ship with the book so readers can verify their own work.

If you are unsure whether something counts as "the end goal", ask before writing it.

## Never give Sophia the answer

This applies in conversation too, not just in files. Sophia wants to build it herself.

- **Give her everything she needs to build it on her own:** the concepts, the spec, the sources, and how to verify it. The material should be complete enough that she can succeed without asking.
- **When she gets stuck, nudge; don't solve.** Start with the smallest hint that could unblock her: a question, a pointer to the relevant spec section, or what to look at or print. Go one step further only if that isn't enough.
- **Don't write, fix or rewrite her code**, even when you can see the bug. Point at where to look and why, and let her make the change.
- **Explaining concepts is always fine.** How a protocol works, what a field means, what an error message means. Explaining how *her* solution should be written is not.
- **Only if she explicitly asks for the answer** may you give it. Even then, confirm first that she's sure.

**Every time she gets stuck, log it in `STUCK.md`**: what confused her, where, and which nudges you gave. It is a signal that the material needs refining (see `loop.md`, steps 2 and 3).

## How the work flows

The full workflow is in **`loop.md`**. Read it before working on any section. In short:

0. **New project:** before anything else, an agent **interviews Sophia** about how she wants the book structured and how it should progress (e.g. one layer at a time, feature by feature), then drafts the project file from her answers and gets her approval. Never write a project file without asking. See "Starting a new project" in `loop.md`.
1. **Writer agent** proposes an outline, waits for Sophia's OK, then writes the learning material (concepts, sources, spec, the task described in prose, tiered hints, verification against chosen oracles, out-of-scope notes) and the test suite.
2. **Sophia** reads the material, answers its self-checks and implements the section, using the implementation check's Verify and Help buttons. Every time she gets stuck it lands in `STUCK.md`, from the checkers or from whoever is with her.
3. **Verification agent** works through the section's `STUCK.md` entries with her, one correction to the material or tests at a time, applying only what she approves. Skipped if there are no entries.
4. **Implementation agent** (sections with code) checks her implementation, gives feedback without solving, and corrects the material and tests where they were wrong.
5. **Writing agent** helps her write the chapter: feedback on her drafts, and drafts of a passage only when she asks. Her code becomes the chapter's summary block; her codebase is the reference.
6. Each agent signs off in `agent-bookkeeping.md` when she says its pass is **done**. Next section.

Every book starts with a skippable **section 00 (Foundations)**. It is reading only, with no code and no tests, and lays the foundations of the book's subject (not programming basics). Sections never reach ahead: each one builds only on what came before. See "Section 00" in `loop.md`.

You will usually be spawned for **one section** without the history of earlier conversations. These files are your context:

- `loop.md`: the generic workflow, shared by every project
- `projects/<name>/<name>.md`: the project file (scope, platform, conventions, default oracles, known gotchas, section list). It overrides `loop.md` where they conflict.
- `agent-bookkeeping.md`: where every book stands, and what earlier agents did. Read your project's entries before starting, and sign off only when Sophia says the step is done.
- `STUCK.md`: every place she got stuck, and what helped. Read your project's entries before starting.

## Repo layout

```
loop.md                   the workflow
agent-bookkeeping.md      shared log + status tables
STUCK.md                  shared log of where Sophia got stuck
projects/<name>/          per-project workspace: <name>.md, material/, answers/, src/ (all code)
projects/theme.css        the Mint theme's colors and fonts, for material and visuals
projects/material.css|js  shared style and script for every material page
scripts/                  the material server (answer checking, implementation checks)
content/docs/<name>/      the published book (meta.json with "root": true = its own sidebar)
app/, components/, lib/   the Fumadocs (Next.js) site
fumadocs-studio.config.ts the live editor's config
justfile                  commands
```

## Commands

Run `just` to list them. The main ones:

- `just install`: install dependencies
- `just run`: the site at http://localhost:3000
- `just edit`: the live editor (Fumadocs Studio) at http://localhost:5180
- `just work`: the site and the editor together
- `just new <slug> "<Title>"`: create a new book root
- `just material <project> [NN]`: read a project's material, with self-check answers checked by Claude
- `just check`: lint and type check
- `just build`: production build

pnpm is the package manager.

## Ground rules

- **Consult before writing.** Propose, show a draft, and wait for Sophia's OK.
- **Never leak the implementation**, whether in prose, hints or tests. **Never give Sophia the answer**: nudge when she is stuck (see above).
- **Verify against an oracle** (real world, interop, reference swap, golden data, invariants, ...; see `loop.md`). Use the real world, as early as possible, when it's available. If no oracle fits, suggest one to Sophia.
- **Cite sources** (Wikipedia, specs/RFCs, official docs, man pages) for every non-trivial claim.
- **Keep everything clean and readable.** Readers will study it.
- **Record decisions straight away.** When Sophia decides something, for the whole book or for one section, write it into the project file in the same turn, not at the end of the conversation. A decision that lives only in the chat is lost to the next agent. During the interview, keep the project file as a draft and add each answer as it comes (see "Starting a new project" in `loop.md`).
- **Detail only what's next.** Plan only the section being worked on in depth. Don't flesh out later sections ahead of time; ideas for them go in the project file's **Later** list as one line (see "The section map" in `loop.md`).
- **Don't commit** unless Sophia asks. At each sign-off, ask her whether to commit the step.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
