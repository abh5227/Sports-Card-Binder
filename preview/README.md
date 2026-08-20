# Design previews

Standalone pages, each one a round of the design process. Open any of them straight
in a browser — there is no build step and no server.

They are committed because [`../docs/design-decisions.md`](../docs/design-decisions.md)
**cites them by file and line** as the evidence for settled decisions. A record whose
citations point at files that are not in the repository is a broken citation, and the
decisions here were all made by looking at these exact pages.

Start with **`locked.html`** — every settled decision from Rounds 1–5 assembled on one
page. The others are the rounds that produced them, kept as they were judged.

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
