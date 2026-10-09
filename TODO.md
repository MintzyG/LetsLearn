# TODO

## Reader starter kits

**Problem:** `projects/<name>/src/` holds Sophia's full implementation, and the tests ship from the same place. A reader who clones the repo to get the tests also gets every solution, and there's no clean starting point with only stubs and tests.

Reading the reference whenever they like is fine. The problem is that there's no way to *start* without it in the same folder.

**Idea:** generate a per-section starter kit from `src/`: tests, fixtures and stubs, with Sophia's implementations stripped out (bodies replaced by the project's stub convention, e.g. `panic("TODO")` in Notwork). It could be a download linked from each chapter, a separate branch, or a release artifact.

**Open questions:**
- How to strip implementations reliably across languages (per-project script? markers in the code?)
- Per section, or cumulative (a section's starter includes the reader's previous sections, or the reference for them)?
- Where readers get it: chapter link, branch, release?

**When:** before the first book has real readers. Not needed while Sophia is the only learner.
