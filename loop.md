# The Loop

Read this whole file before doing anything. You are an agent working on **one section** of a learn-by-building book. You will not have the conversation that produced it, so this file and the project file are your context.

**Read next:** the project's standalone project file, `projects/<name>/<name>.md` (your task names the project). It holds everything specific to that project: what it is, its scope, platform, environment, code conventions, default oracles, known gotchas and section list. Where this file and the project file disagree, the project file wins.

---

## The idea

Each project is a book where the reader builds something real from the bottom up. It lives in a Fumadocs site (edited with `@fumadocs-editor/studio`) that holds many projects of this kind.

**Sophia is both the author and the first learner.** She learns each section by implementing it herself, then writes the chapter for readers who know less than she does. Her working code becomes the reference implementation readers see at the end of each chapter, in a collapsed summary block. Her book is the reader material, and the tests (refined during the loop) ship with it so readers can verify their own work.

Chapters **describe** the implementation; they don't show it. Readers build it themselves and see the reference code only at the end, or go straight to it whenever they choose.

## Principles

- **A toy that works on the real thing.** The aim is to work in the real world along the happy path, not to conform to every spec and corner case. Each section lists what is **out of scope**, with one sentence on why real implementations need it.
- **Verify against an oracle.** Every section is checked against a source of truth outside the learner's code (see [Oracles](#oracles)). When the real world is available, use it, and as early as possible within the section.
- **Clean, readable code.** The code becomes the reference that readers study: small functions, clear names, and comments that explain *why*. No clever tricks or dense code. Prefer clarity over performance.
- **Never leak the implementation.** Neither the material nor the tests may contain the solution.
- **Consult before writing.** Propose an outline and wait for Sophia's OK before producing full material.

---

## Roles

| Role | Who | Does |
|---|---|---|
| Learner/Author | Sophia | Implements the section, writes the human chapter, decides when a step is done |
| Writer agent | an agent | Writes the learning material and test suite for one section, then refines both while Sophia works |
| Reviewer agent | an agent (need not be the writer) | Reviews the finished step and makes suggestions with confidence scores |

---

## Starting a new project

Before any section is written, the project needs its project file, `projects/<name>/<name>.md`. **Don't write it on your own: interview Sophia first.** The project file captures *her* plan for how the book progresses, and every later agent depends on it.

### 1. Ask

Ask her, and discuss until each answer is clear:

- **What is it?** What does the reader build, and what does "done" look like for the whole book?
- **Who is the reader?** What are they assumed to know or be comfortable with? Why this language for this project?
- **How should it progress?** This is the most important question. Is it bottom-up, one layer at a time (as in Notwork: Ethernet → ARP → IPv4 → ...)? Feature by feature? From a minimal end-to-end version that grows? Something else? Propose options that fit the subject, with trade-offs, but let her choose.
- **How big is a section?** One concept, one layer, one milestone? Should a section be split into steps (e.g. "build it locally, then against the real thing")?
- **What does finishing a section give the reader?** Ideally each section ends in a standalone achievement, so a reader who stops partway through the book still built something real (in Notwork: after ICMP, you have your own working ping).
- **Scope**: how far the toy goes, and what is explicitly out.
- **Language, platform and environment**: what runs where, and what the reader is assumed to have (e.g. Notwork assumes one Linux machine).
- **Default oracles**: how the work is verified (see [Oracles](#oracles)). Suggest the ones that fit; if none do, propose a new one.
- **Visuals**: which kinds of visuals does the project need (see [Visualization](#visualization))? Ask about each kind:
  - **Output visuals**: visuals of the code running or of what it produces (a trace, a plot, a rendered simulation). Should the reader build these as part of the project?
  - **Explanatory visuals**: visuals of the topics, logic and math needed to build it (a diagram of a protocol, an animation of gradient descent), not of the code itself. Where would they help her learn?
  - **Presentation visuals**: will she make videos about the material?
- **Code conventions**: how tests, fixtures and stubs are laid out inside `src/`.
- **Sources**: which references the material should lean on (specs, papers, books, docs).

### 2. Draft and confirm

Draft the project file from her answers and show it to her. Use `projects/notwork/notwork.md` as the golden example of its shape: what it is, the reader, how it progresses, scope, platform and environment, default oracles, visuals, code conventions, sources, known gotchas, and a section table with each section's achievement. Revise until she approves. Only then create `content/docs/<name>/` (`just new <name> "<Title>"`) and start the first section.

When she approves, sign off in `agent-bookkeeping.md` as `<project> / project-file`.

---

## The loop (one section at a time)

Each project has two homes in this repo:

```
projects/<name>/
  <name>.md     the project file
  material/     learning material, one folder per section (writer)
  reviews/      reviews, one file per section (reviewer)
  src/          all code: Sophia's implementation, tests, fixtures, stubs
content/docs/<name>/   the published chapters (Sophia)
```

Paths below are relative to `projects/<name>/` unless they say otherwise.

### 1. Writer: learning material + tests

Propose an outline of the section to Sophia first, including the **oracles** you plan to use, and wait for her OK.

Then produce:

**a) `material/NN-slug/material.md`.** This is "Sophia's chapter": the base she learns from and rewrites for less experienced readers. It contains:
- **Concepts**: what this piece is, why it exists, and how it fits with its neighbors.
- **Sources** for every non-trivial claim: Wikipedia, specs/standards, official docs, man pages. Link them inline.
- **Spec**: data layouts, formats, and the exact function/type signatures to implement, along with the behavior each must have.
- **Task**: what to build, **described, never shown**. No implementation code, no pseudocode that is really code.
- **Hints**, tiered: a nudge first, then the approach. Still no solution code.
- **Verification**: which oracles this section uses and why (see [Oracles](#oracles)), and how to run each check, under the constraints in the project file.
- **Environment notes** for anything the reader must set up.
- **Out of scope**: what is skipped and why real implementations need it.
- **Explanatory visuals** where a concept is hard to grasp from text alone (see [Visualization](#visualization)). These are optional, for Sophia's learning only.

**b) The test suite**, in `src/`, laid out as the project file says.
- Tests specify **what** must happen, never **how**.
- **Tests are sequential checks of working code.** Order them the way the work naturally progresses, so each one passing marks a real milestone, and the first failing test shows where she is. They nudge naturally that way.
- **Don't make it easy.** Each test should be a step worth taking, not a tiny step that does the thinking for her. The goal is learning, not a green checkmark.
- **Failure messages say what is wrong, never how to fix it.** For example, "expected EtherType 0x0806, got 0x0608" rather than "swap the bytes".
- Keep them small: only the behavior this section teaches.
- Prefer **real captured data** as fixtures, and note where each fixture came from.
- Make every chosen oracle runnable, even when it needs privileges or a live environment (put it behind a flag or env var if needed).
- You may add stubs (signatures, doc comments, placeholder bodies) so the tests compile or run. Nothing more.
- These tests ship with the book, so write them for any reader, not just Sophia.

### 2. Sophia codes and writes

She implements the section and writes the chapter in her own words in `content/docs/<name>/`.

### 3. Refine

When she gets stuck, **nudge, never solve**: give the smallest hint that could unblock her (a question, a pointer to the spec, what to inspect), and don't write or fix her code. Give the answer only if she explicitly asks for it.

**Every time she gets stuck, the agent with her logs it in `STUCK.md`**, following the format in that file.

Then the writer works through the `STUCK.md` entries for the section and refines the material (clearer spec, better hint, missing source) and the tests if they were wrong or unclear. Fill in each entry's material fix. Repeat until she says the section is **done**.

When she says done, the writer **signs off** in `agent-bookkeeping.md`.

### 4. Her code becomes the reference

Her implementation goes into the chapter's collapsed **summary block**. Her codebase is the reference for readers.

### 5. Reviewer: review the step

A reviewer agent reviews the whole step: the material, the tests, Sophia's code, her chapter, and the section's `STUCK.md` entries. Write the review to `reviews/NN-slug.md`. Each suggestion has:

- **What**: the concrete issue and where (`file:line` or section heading)
- **Why**: what goes wrong, or what a reader would trip on
- **Suggestion**: what to change
- **Confidence (1–5)**:
  - 5: verified (ran it, checked the source/spec)
  - 4: very likely, with clear reasoning
  - 3: probable, worth a look
  - 2: unsure, a judgment call
  - 1: hunch

Review for:
- correctness, against specs and real behavior
- clarity for a less experienced reader
- code readability
- test quality: does any test leak the implementation, make the task too easy, or test the wrong thing?
- whether the oracles fit the section
- missing sources
- whether every `STUCK.md` entry is addressed in the material and in her chapter

Make suggestions only; Sophia decides what to apply.

When she says done, the reviewer **signs off** in `agent-bookkeeping.md`.

### 6. Next section

Loop.

---

## Oracles

An oracle is a source of truth outside the learner's code that says whether it works. The project file declares its default oracles. For each section, the writer picks the ones that fit, says why in the material, and makes them runnable. Combining oracles is normal.

| Oracle | What it checks | Example |
|---|---|---|
| **Real world** | It works against real systems | ping a real host, fetch a real web page |
| **Interop** | A real tool accepts your output or drives your code | stdlib HTTP reads off your TCP; a real assembler accepts your compiler's output |
| **Reference swap / differential** | Same interface, same input → same output as the real library | your autograd vs PyTorch, your matmul vs NumPy |
| **Golden data** | Recorded inputs produce known outputs | captured packets, parser test files |
| **Round-trip / property-based** | Properties hold over many generated inputs, e.g. `decode(encode(x)) == x` | serializers, codecs |
| **Invariants** | Something must always hold | energy conservation in a simulation, a sorted array stays sorted |
| **Metamorphic / convergence** | The exact answer is unknown, but a known change to the input has a predictable effect; e.g. halving the step size shrinks the error at the expected rate | numerical methods, simulations |
| **Numerical check** | Compare against a slow, obviously-correct version | backprop gradients vs finite differences |
| **Threshold benchmark** | A stochastic result reaches a target | MNIST accuracy > 95%, loss below a bound |
| **Visual** | A human looks at the output; the last resort, usually alongside another oracle | your trajectory overlaid on the reference one |
| **Suggest a new one** | None of the above fits | Propose an oracle to Sophia, explain why, and wait for her OK |

Real-world checks can break when the world changes (a server goes away). Back them with frozen fixtures (golden data) so tests stay reproducible, and keep the live check as the final step.

---

## Visualization

There are three kinds. Only one may be built by agents.

| Kind | What it is | Who builds it |
|---|---|---|
| **1. Output visuals** | Visuals of the learner's code running or of what it produces, e.g. a trace viewer, a loss curve, a packet timeline, a rendered simulation | **Sophia and readers.** If she includes one in the book, it is part of the project, and readers build it too. Agents never build it. |
| **2. Explanatory visuals** | Visuals of the topics, logic and math needed to build the project, not of the code itself, e.g. an interactive protocol diagram or an animation of the math | **Agents may build Sophia's learning version** in the material. The version in the book is hers. |
| **3. Presentation visuals** | Visuals for Sophia's videos about the material (3Blue1Brown style) | **Sophia.** Agents never build them. |

---

## Bookkeeping

Every agent records its work in `agent-bookkeeping.md`, following the format in that file. Sign off only when Sophia says the step is done. Read the existing entries for your project before starting so you know where the book stands, and read `STUCK.md` too.
