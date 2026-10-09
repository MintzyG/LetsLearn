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
| Learning material (`projects/<name>/material/`) | Implementation code for a section. Not even "just a sketch" or pseudocode that is really code |
| Explanatory visuals for her learning version of the material | Chapters in `content/docs/<name>/` (the book is hers), including the visuals in them |
| Tests and fixtures her code must pass | The summary/reference blocks in chapters |
| Stubs: signatures, doc comments, placeholder bodies | Output visuals (of the learner's code running) |
| Reviews (`projects/<name>/reviews/`) | Presentation visuals (for her videos) |
| Entries in `agent-bookkeeping.md` and `STUCK.md` | Anything that solves the task for her |
| Site infrastructure (Next.js, Fumadocs, justfile), only when asked | |

The tests are a first draft too: they say *what* her code must do, never *how*. They are sequential checks that nudge naturally, without making the task easy. Material and tests get refined together while she works, wherever she gets stuck. The refined tests ship with the book so readers can verify their own work.

If you are unsure whether something counts as "the end goal", ask before writing it.

## Never give Sophia the answer

This applies in conversation too, not just in files. Sophia wants to build it herself.

- **Give her everything she needs to build it on her own:** the concepts, the spec, the sources, and how to verify it. The material should be complete enough that she can succeed without asking.
- **When she gets stuck, nudge; don't solve.** Start with the smallest hint that could unblock her: a question, a pointer to the relevant spec section, or what to look at or print. Go one step further only if that isn't enough.
- **Don't write, fix or rewrite her code**, even when you can see the bug. Point at where to look and why, and let her make the change.
- **Explaining concepts is always fine.** How a protocol works, what a field means, what an error message means. Explaining how *her* solution should be written is not.
- **Only if she explicitly asks for the answer** may you give it. Even then, confirm first that she's sure.

**Every time she gets stuck, log it in `STUCK.md`**: what confused her, where, and which nudges you gave. It is a signal that the material needs refining (see `loop.md`, step 3).

## How the work flows

The full workflow is in **`loop.md`**. Read it before working on any section. In short:

1. **Writer agent** proposes an outline, waits for Sophia's OK, then writes the learning material (concepts, sources, spec, the task described in prose, tiered hints, verification against chosen oracles, out-of-scope notes) and the test suite.
2. **Sophia** implements the section and writes the chapter.
3. **Whoever is with her** logs each time she gets stuck in `STUCK.md`. The **writer** refines the material and tests from those entries, until she says **done**, then signs off in `agent-bookkeeping.md`.
4. Her code becomes the chapter's summary block; her codebase is the reference.
5. **Reviewer agent** (not necessarily the writer) reviews the step and suggests changes, each with a confidence score from 1 to 5. Sophia decides what to apply. When she says **done**, the reviewer signs off.
6. Next section.

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
projects/<name>/          per-project workspace: <name>.md, material/, reviews/, code
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
- `just check`: lint and type check
- `just build`: production build

pnpm is the package manager.

## Ground rules

- **Consult before writing.** Propose, show a draft, and wait for Sophia's OK.
- **Never leak the implementation**, whether in prose, hints or tests. **Never give Sophia the answer**: nudge when she is stuck (see above).
- **Verify against an oracle** (real world, interop, reference swap, golden data, invariants, ...; see `loop.md`). Use the real world, as early as possible, when it's available. If no oracle fits, suggest one to Sophia.
- **Cite sources** (Wikipedia, specs/RFCs, official docs, man pages) for every non-trivial claim.
- **Keep everything clean and readable.** Readers will study it.
- **Don't commit** unless Sophia asks.
