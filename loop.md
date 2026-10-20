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
- **Detail only what's next.** Only the section about to be worked on is planned in depth. Later sections stay one-liners, and far-off stretches share one line, until work reaches them (see [The section map](#the-section-map)). Planning everything up front is tiring, and the plan changes anyway once she starts building.
- **Progressive: never reach ahead.** A section builds only on 00 and the sections before it. Don't teach, use, or lean on examples from later sections (no ping in the Ethernet section). A one-line "this comes back in section NN" pointer is the most a later topic gets.

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
- **What are the subject's foundations?** What should section 00 cover so that 01 can start building? See [Section 00](#section-00-foundations).
- **The section map**: the rough road from 00 to done, at fading detail (see [The section map](#the-section-map)). Don't plan sections in depth here; that happens when each one comes up.
- **How big is a section?** One concept, one layer, one milestone? Should a section be split into steps (e.g. "build it locally, then against the real thing")?
- **What does finishing a section give the reader?** Ideally each section ends in a standalone achievement, so a reader who stops partway through the book still built something real (in Notwork: after ICMP, you have your own working ping).
- **Scope**: how far the toy goes, and what is explicitly out.
- **Language, platform and environment**: what runs where, and what the reader is assumed to have (e.g. Notwork assumes one Linux machine).
- **Default oracles**: how the work is verified (see [Oracles](#oracles)). Suggest the ones that fit; if none do, propose a new one.
- **Visuals**: which kinds of visuals does the project need (see [Visualization](#visualization))? Ask about each kind:
  - **Output visuals**: visuals of the code running or of what it produces (a trace, a plot, a rendered simulation). Should the reader build these as part of the project?
  - **Explanatory visuals**: visuals of the topics, logic and math needed to build it (a diagram of a protocol, an animation of gradient descent), not of the code itself. Where would they help her learn?
  - **Presentation visuals**: will she make videos about the material?
- **Challenges & deepenings**: should each section end with optional hooks for readers who want more (challenges: things to build with what they now know; deepenings: further into the section's topic)? If so, how are they tested, if at all?
- **Code conventions**: how packages, tests and fixtures are laid out inside `src/`.
- **Sources**: which references the material should lean on (specs, papers, books, docs).

### 2. Draft and confirm

Draft the project file from her answers and show it to her. Its shape: what it is, the reader, how it progresses, scope, platform and environment, default oracles, visuals, code conventions, sources, known gotchas, and the section map (see [The section map](#the-section-map)). Revise until she approves. Only then create `content/docs/<name>/` (`just new <name> "<Title>"`) and start the first section.

When she approves, sign off in `agent-bookkeeping.md` as `<project> / project-file`.

---

## Section 00: Foundations

**Every book starts with a section 00.** It lays the foundations of the book's **subject** (networking for Notwork), so 01 can start building instead of explaining the field. It is not a programming course: no language tutorial and no general CS basics like hex or binary. General topics (the OS, number formats, ...) come in only for the parts the subject uses in its own particular way, and only briefly.

- **Reading only.** No code, no tests, no spec, no build task. Just concepts, sources, and the tools the reader needs to get started.
- **Skippable.** A reader who already knows the material skips it. Open with a short "you can skip this if you know..." list, so readers can decide in a minute.
- **The subject's ground floor.** Cover the ideas the whole field rests on. Each section still teaches its own protocol, algorithm or component when it gets there, so don't preview the book section by section.
- **Same loop otherwise, lighter.** Outline first, Sophia's OK, then material. She writes the 00 chapter, and `STUCK.md` entries apply: with no code and no tests, her self-check answers are the only signal of where the material fails, so the answer checker's entries matter most here. The review is lighter too: it checks facts, sources, clarity and the `STUCK.md` entries, with no code or test review. It has no summary block, because it has no code.
- **The same applies to any reading-only section** a project has.

In the material it lives at `material/00-foundations/material.html`.

---

## The section map

The project file plans the book at **fading detail**: sharp close up, rough far away. Every section gets its detail when work reaches it.

- **The next section** (the one being written now) is the only one planned in depth: what it builds, its achievement, its oracles, budget and unlocks.
- **The few sections after it** get one line each: what the section is about, not how.
- **Far-off stretches** share one line per range of sections or per part ("Part VI: the alternatives to attention, built and compared"). The farther away, the bigger the range a line covers.
- **Later notes.** An idea about a far section ("29 should reuse 28's long-range task") goes into the project file's **Later** list as one line, and nobody acts on it until that section comes up. Nothing gets lost, and nothing gets detailed early.
- **The map changes.** Reaching a section is the moment to rename, split, merge, reorder or drop it, and to break the next rough range into one-liners. Since nothing far away was detailed, nothing is thrown away.
- **Project-wide lists grow the same way**, such as an unlock ledger or a list of datasets: entries are added as sections are detailed, not guessed for the whole book up front.

Book-wide decisions (what it is, the reader, how it progresses, scope, platform, oracles, conventions) are not part of this: the interview settles them up front, because every section depends on them.

---

## The loop (one section at a time)

Each project has two homes in this repo:

```
projects/<name>/
  <name>.md     the project file
  material/     learning material, one folder per section (writer)
  reviews/      reviews, one file per section (reviewer)
  src/          all code: Sophia's implementation, tests, fixtures
content/docs/<name>/   the published chapters (Sophia)
```

Paths below are relative to `projects/<name>/` unless they say otherwise.

### 1. Writer: learning material + tests

**Detail the section first.** Read its line in the section map and any **Later** notes for it. With Sophia, turn that line into the section's entry in the project file (what it builds, its achievement, oracles, unlocks, and its **size**: how long the reading takes, how long the build takes, and how long any training run takes, e.g. "short read, ~15 minutes" or "big build, ~2 days"). The material aims for that size from the start. Then sharpen the next stretch of the map by one step: the following one-liners, and a rough range broken into one-liners if it is now close. This is the only time a section gets detailed.

Then propose an outline of the section to Sophia, including the **oracles** you plan to use, and wait for her OK.

Then produce:

**a) `material/NN-slug/material.html`**, an HTML page (see [Material format](#material-format)). This is "Sophia's chapter": the base she learns from and rewrites for less experienced readers. It contains:
- **Concepts**: what this piece is, why it exists, and how it fits with its neighbors.
- **Sources** for every non-trivial claim: Wikipedia, specs/standards, official docs, man pages. Link them inline.
- **Spec**: data layouts, formats, and what must exist (the types and functions, their names, inputs and outputs, and the behavior and errors each must have), described in prose like an RFC or a man page. A spec is **not stubs**: never hand her code to fill in. The names must be exact, because the tests use them.
- **Task**: what to build, **described, never shown**. No implementation code, no pseudocode that is really code.
- **Hints**, tiered: a nudge first, then the approach. Still no solution code.
- **Verification**: which oracles this section uses and why (see [Oracles](#oracles)), and how to run each check, under the constraints in the project file.
- **Environment notes** for anything the reader must set up.
- **Out of scope**: what is skipped and why real implementations need it.
- **Explanatory visuals** where a concept is hard to grasp from text alone (see [Visualization](#visualization)), embedded in the page next to the text they explain. These are optional, for Sophia's learning only.
- **Challenges & deepenings**, if the project file asks for them: optional hooks for readers who want more, described and never solved, and never reaching ahead.

#### Material format

The material is **HTML, not Markdown**, so Sophia can read the text, use the visuals and answer the self-checks on one page.

- **Reading it:** `just material <project> <NN>` serves the material locally and opens the page. Opened as a plain file it still works, except for answer checking.
- **One page per section:** `material/NN-slug/material.html`. It links the shared stylesheet and script at the top of `projects/`: `<link rel="stylesheet" href="../../../material.css">` and `<script src="../../../material.js" defer></script>`. Don't restyle per page; if the shared style is missing something, extend `projects/material.css`.
- **Plain semantic HTML** inside `<main>`: headings, paragraphs, lists, tables, `<code>`/`<pre>`. Tiered hints are `<details>` blocks. The "you can skip this if..." list (section 00) goes in a `<div class="callout">`.
- **Self-checks** are a `<section class="self-check">` at the end of the `<h2>` section they test: a `<p class="self-check-title">Self-check</p>`, the questions (visible), then the reference answers folded in `<details class="answers"><summary>Answers</summary>...</details>`. The shared script puts an answer box between the questions and the answers. Sophia writes her answer and presses Check, and Claude (`claude -p`, through `scripts/material-server.mjs`) judges it against the reference answers and the section's text, and replies with a verdict and a nudge in the browser. Every attempt is logged to `projects/<name>/answers/NN-slug.jsonl`. An answer that isn't fully right opens a `STUCK.md` entry; later attempts add their nudges to it, and a correct one closes it. The writer treats these entries like any other `STUCK.md` entry. Write reference answers that state the key idea plainly, since they are what the checker judges against.
- **Theme:** everything follows the site's Mint theme. Its colors and fonts live in one place, `projects/theme.css`, which mirrors `app/mint.css`: change both together, and nothing else. Never hard-code a color in a page or visual; use the tokens (`--surface`, `--panel`, `--text`, `--accent`, `--series-1`, `--series-2`, ...). Chart series use `--series-1` (green) then `--series-2` (orange), validated for color-vision deficiency on both surfaces. Magnitude (a heatmap) uses the green ramp listed in `theme.css`.
- **Explanatory visuals** are standalone pages in `material/NN-slug/visuals/`, each working on its own in a browser, in light and dark mode. Each one links `../../../../theme.css` and loads `../../../../material.js`, and keeps its own layout CSS and JS inline. The material embeds a visual where the text needs it, as `<figure class="visual"><iframe src="visuals/<file>.html" title="..." loading="lazy"></iframe><figcaption>... (<a href="visuals/<file>.html">open on its own</a>)</figcaption></figure>`; the shared script sizes the iframe to fit. The same visual may be embedded more than once.
- **Render it and look at it** before handing it over. Screenshot the page and every visual in light and dark mode (headless Chrome: `google-chrome-stable --headless=new --screenshot=out.png --window-size=1100,900 <url>`; add `--blink-settings=preferredColorScheme=0 --force-dark-mode` for dark), and drive each interaction to its extremes (run to the end, the largest and smallest settings). Reading the code doesn't catch a marker that vanishes into a heatmap.
- **Visuals must not leak the implementation.** Their source is readable, so a visual never contains the code the section asks her to write. Precompute results and embed them as data, or use a method other than the one she'll build (e.g. estimate a slope by nudging instead of the derivative she will derive). Note in a comment at the top how the data was made.
- No build step: pages are plain files, served as they are.

**b) The test suite**, in `src/`, laid out as the project file says.
- Tests specify **what** must happen, never **how**.
- **Tests are sequential checks of working code.** Order them the way the work naturally progresses, so each one passing marks a real milestone, and the first failing test shows where she is. They nudge naturally that way.
- **Don't make it easy.** Each test should be a step worth taking, not a tiny step that does the thinking for her. The goal is learning, not a green checkmark.
- **Failure messages say what is wrong, never how to fix it.** For example, "expected EtherType 0x0806, got 0x0608" rather than "swap the bytes".
- Keep them small: only the behavior this section teaches.
- Prefer **real captured data** as fixtures, and note where each fixture came from.
- Make every chosen oracle runnable, even when it needs privileges or a live environment (put it behind a flag or env var if needed).
- **No stubs.** Don't write signatures, placeholder bodies or skeleton files for her code. The tests use the names from the spec; until she writes them the tests don't compile, and the compiler error says what's missing.
- These tests ship with the book, so write them for any reader, not just Sophia.

### 2. Sophia codes and writes

She implements the section and writes the chapter in her own words in `content/docs/<name>/`.

### 3. Refine

When she gets stuck, **nudge, never solve**: give the smallest hint that could unblock her (a question, a pointer to the spec, what to inspect), and don't write or fix her code. Give the answer only if she explicitly asks for it.

**Every time she gets stuck, the agent with her logs it in `STUCK.md`**, following the format in that file.

Then the writer works through the `STUCK.md` entries for the section and refines the material (clearer spec, better hint, missing source) and the tests if they were wrong or unclear. Fill in each entry's material fix. Repeat until she says the section is **done**.

When she says done, the writer **signs off** in `agent-bookkeeping.md`, then **asks Sophia whether to commit** the step. Commit only if she says yes.

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

When she says done, the reviewer **signs off** in `agent-bookkeeping.md`, then **asks Sophia whether to commit**. Commit only if she says yes.

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
| **2. Explanatory visuals** | Visuals of the topics, logic and math needed to build the project, not of the code itself, e.g. an interactive protocol diagram or an animation of the math | **Agents may build Sophia's learning version**, embedded in the material (see [Material format](#material-format)). The version in the book is hers. |
| **3. Presentation visuals** | Visuals for Sophia's videos about the material (3Blue1Brown style) | **Sophia.** Agents never build them. |

---

## Bookkeeping

Every agent records its work in `agent-bookkeeping.md`, following the format in that file. Sign off only when Sophia says the step is done. Read the existing entries for your project before starting so you know where the book stands, and read `STUCK.md` too.
