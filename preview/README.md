# Design previews

Standalone pages, each one a round of the design process. Open any of them straight
in a browser — there is no build step and no server.

They are committed because [`../docs/design-decisions.md`](../docs/design-decisions.md)
**cites them by file and line** as the evidence for settled decisions. A record whose
citations point at files that are not in the repository is a broken citation, and the
decisions here were all made by looking at these exact pages.

Start with **`locked.html`** — every settled decision from Rounds 1–5 assembled on one
page. The others are the rounds that produced them, kept as they were judged.

## A committed preview is evidence, not a mock

These pages started as throwaway mocks — built from real material, judged by looking, never
committed. **That changed the moment they were committed.**
[`../docs/design-decisions.md`](../docs/design-decisions.md) cites them **by file and line**
as the artifacts particular decisions were made against, so editing one in place moves what
the record points at, in a public document, silently.

> **Iterate freely before committing. After that, a preview that needs to change becomes a
> new file.** That is why the rounds are numbered `round3-page.html`, `round3b-proportional.html`,
> `round3c-opacity.html` rather than one file revised three times: each is the thing that was
> looked at when a particular decision was taken.

**One exception, and it is narrow.** A committed preview may be corrected **only where the
correction cannot change what it renders, and cannot move what any citation points at.**
Dead CSS with no emitter, and an emitted class with no rule, both qualify — removing them
changes no pixel and no line anyone points at. Anything that could change either becomes a
new file.

That keeps the protection where it earns its keep — provenance and citations — without
freezing sixteen files against ever being cleaned.

This is also why `preview/` is excluded from the formatter in `biome.json`. **The exclusion
protects the citations, not the code style.** A formatter is only the most obvious tool with
write access here — the same applies to a codemod, an auto-fixer, or a well-meaning edit.

## The card images are deliberately absent

**Every preview will open with empty pockets, and that is intentional.**

The scans are copyright-encumbered marketplace images. They were used for local design
work — judging how a real card sits in a real pocket — and they must never be committed
to a public repository. `.gitignore` denies everything under `preview/` by default and
allows back only these pages, so a new image dropped in here stays out even if nobody
remembers to add a rule for it.

What survives without them is what the previews are actually for: the geometry, the
pocket treatment, the page and frame, the type, and the reasoning written into each page.
Broken images are the cost of not shipping other people's photographs.

To see them populated, put 300×420 JPEGs in `preview/img/` named as each page expects.
