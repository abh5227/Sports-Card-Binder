# The Binder — project log

Decisions with the reasoning that produced them, and the alternatives that lost, recorded so
they do not get re-proposed. Where a position was overturned by evidence, the overturning is
here too.

**This log records what was wrong as carefully as what was right, and that is the point of
it.** A record containing only the decisions that held teaches nothing about how to reach one.
The planner errors, the report that contradicted the machine, the three wrong numbers, the
control that could not fail — all of it stays. **The pass made before this document became
public removed what is private. It removed nothing for being unflattering, and no later pass
should.**

**Reading order.** This file is the project: what it is committed to, and how it learned.
[design-decisions.md](design-decisions.md) is the visual design in depth — the arguments, the
measurements, and the limit of each justification. [CLAUDE.md](../CLAUDE.md) is neither a
record nor an argument; it is the operating instrument, what a future session must *do*.
**Where this log and `CLAUDE.md` describe the same event, the rule is there and the incident
is here.**

The D-numbers belong to this document. `docs/design-decisions.md` refers to them and mints
none of its own.

---

## Decided

### D1 — Interface first, pricing deferred
Consequence: images become critical path.

### D2 — Binder as the primary interface
Two-page spread, cards in pockets, flip through, sortable, click to lift out. **Two pocket
layouts only: 9 and 4.** Twelve dropped.

**Twelve was then found alive in three places after being dropped.** A superseded revision of
the stage plan still listed it. A Round 4 prompt said "24 slots" — which is a 12-pocket
spread, where a 9-pocket spread is 18 — quoting that stale plan as knowledge. And this
repository's own `README.md` told visitors that pages hold 4, 9 or 12, publicly, until the
migration that produced this file. **Nobody swept.** See *On records*, below.

### D3 — Bounded catalogue, not universal coverage
*Rejected: per-card live API lookup.* Universal makes every card added a live call against a
paid API rate-limited to 1/sec. Bounded means one pull per set — instant free search, and
price refresh drops from one request per card owned to one per set.

### D4 — A card and a copy owned are different things
Confirmed by evidence: Andy's photographs show multiple identical copies of the same rookie
card in a single page.

### D5 — Card entry by catalogue search, not a manual form
Typing a thousand cards by hand is where the project dies.

### D6 — Price refresh: manual button first, scheduled later

### D7 — Images from the web; Andy's photos are last resort
**Consequence for design:** previews must use clean web scans, because that is what production
renders.

### D8 — Four sports, no TCG

### D9 — Idealised binder; physical storage not modelled
*Rejected: mirroring physical binders; modelling slabs and holders.* Andy's best cards are in
slabs that were never in a binder, so a physical address is meaningless for exactly the cards
he cares most about.

### D10 — Reserve the seam for retrieval; don't build the room
3,000 cards at 9 per page is 167 spreads. Flipping is browsing and hostile to retrieval.
Retrieval is a separate surface, nothing may foreclose it, divider tabs are destinations — but
search waits until the collection warrants it.

**Measured constraint on that future surface:** a 3,000-card scrolling document janks. The
binder never will; it shows 18 at a time.

### D11 — The stack, decided on merits and not inherited
TypeScript **6** · Svelte 5 + Vite · Fastify · SQLite via better-sqlite3 + Drizzle · Vitest +
Playwright · Biome · **Node 24**.

TypeScript is in the stack for one reason: the catalogue/holding invariant is type-expressible.
Svelte over React because React's reconciliation is something you route around to do direct DOM
measurement. Svelte over vanilla on maintainability, *not* performance. SQLite because
single-user and offline, and backup is copying one file atomically while running. Node 24
forced: 20 is past EOL and `better-sqlite3@13` requires ≥22. TS pinned to 6 — `svelte-check`'s
peer range stops there.

**Known lint gap, accepted deliberately.** `noUnusedImports` and `noUnusedVariables` are off
for `.svelte`; Biome does not parse Svelte templates, so the rule would fire on every
correctly-written parent component. **Tested, not assumed:** an unreferenced import in
`Page.svelte` is reported by neither Biome nor `svelte-check`. Accepted because *a rule that
fires on every correct usage is not a rule, it is noise — and noise kills the rules that work.*
**Revisit if Biome gains Svelte template parsing.**

### D12 — Public repo; nothing personal in it, ever
Data directory outside the repo via `BINDER_DATA_DIR`. A public export of what Andy owns and
paid is a financial disclosure and a theft risk; scraped marketplace images are
copyright-encumbered and ~230 MB besides.

**Deny-by-default, not an allow-list.** `preview/*` then `!preview/*.html` and
`!preview/README.md`, in **`.gitignore`** — not `.git/info/exclude`, which is never tracked and
would have protected one machine. Verified: zero images in any commit.

**A card named is provenance; a card named with a quantity, a grade, a cost or a cert number is
inventory.** The design record names the cards it was judged against, because that is checkable
rather than decorative. A count of what someone owns is the class this rule exists to keep out.

**A public repo needs a demo dataset** — public-domain Library of Congress scans, downloaded
during Spike 01 and since lost from disk. **Two reasons now:** a stranger needs a runnable
demo, and those scans *can* be committed, so their arrival is the route to a CI-able parity
gate.

### D13 — Nothing lives in an iCloud-synced tree
`~/Documents` is a live file-provider domain with Optimize Storage on. **Observed 2026-08-20 on
the development machine: 95 files under it already evicted, source among them.** The ordinary
checks report the machine clean — the legacy sync folders are empty and there are no `.icloud`
placeholders — and only a dataless-flag scan finds them, which is why this is worth writing
down rather than leaving to whoever next looks. Repo at `~/Developer/Sports-Card-Binder`; data
at `~/Developer/binder-data/`, which is the `BINDER_DATA_DIR` default rather than a fixed
location. **iCloud is the backup destination, never the home.**

**Planner error:** the first version put the data directory inside the synced tree — moving the
irreplaceable half somewhere *worse* than the repo.

### D14 — Design Rounds 1–3: what the binder is
The settled specification, without its reasoning. Every argument behind it, and the limit of
each, is in [design-decisions.md](design-decisions.md), Rounds 1–3.

- Bare card at rest; nothing added to the artwork.
- Hover reveals a 90%-opaque panel over the lower card, with a top hairline. **Wrapping never
  truncates.**
- Occupied pockets get a specular-only sleeve; empty pockets get a lit sleeve, dimmed.
- The card carries a directional lit lip on its own edge.
- Gutters at 2 px.
- A single sheen across the whole sheet, not one per pocket.
- 4-pocket is 9-pocket at 2×, proportional in geometry and in type.

**Three planner positions were overturned by building:** that the pocket would solve the
dark-card boundary (measured false — lifting the well *closed* the gap on the card it was meant
to rescue); that the scrim should be ruled out (it covers the redundant nameplate, not the
parallel's signature); and that UI type should not scale with layout.

### D15 — Round 4, the spread: the minimal frame (B)
**B — 40 px:** 11 px of board on each side plus an **18 px spine**. No rings.

*Rejected:* **C**, the strongest objecthood · **D**, a frame carrying a page-edge stack · **A**,
pages and a spine gap only. The frame-cost table that ranked them, and the margins settled
alongside, are in [design-decisions.md](design-decisions.md) and are defended by test.

**Decided by Andy's looking, against both recommendations.** Claude Code recommended D *and*
argued B was dominated and should be dropped from the render. The planner kept it so Andy could
drop it by looking. He kept it instead. **Second time keeping an argued-against variant changed
the outcome.**

**Consequence, not to be undone:** B has no page-edge stack, so the object's thickness
reporting collection size is gone and **must not be retrofitted.**

**Finding that outlived the variant:** in set-completion mode extent comes from the checklist,
not the holdings — so any future size indicator means "how big is this set" there and "how much
do I own" everywhere else.

**Amended at Stage C — the 40 px frame does not scale at 4-pocket.** Round 3's scaling rule
predates the frame, so this was never specified; the port shipped it at 1× while page contents
double, and flagged it. Settled at **1×**, because B won partly on costing only 40 px and
doubling it un-decides the variant. *Raised by Claude Code, decided by the planner.*

**Retired at Stage C — the comparison against a photograph of the real binder.** Round 4
planned it and never ran it. The check existed to decide the frame; the frame is decided, so it
could no longer change anything. Recorded as retired rather than dropped, because **a gate that
is retired should look retired** — otherwise the next reader assumes it is still owed.
*Decided by the planner.*

### D16 — The spread sheen: Model 2, the shallow V
Each sheet owns its own band, the left brighter because it is nearer the light.

*Rejected:* **Model 1**, one continuous sweep · **Model 1b**, Model 1 tuned to put the peak on
the right page — which measured *backwards*, leaving the left sheet at floor luminance against
a light coming from the left. The luminances are in
[design-decisions.md](design-decisions.md).

**Two arguments, and neither was the static appearance.** One band cannot light two sheets — it
either sits on the gutter or leaves a sheet dark. And **a band spanning both sheets cannot
rotate with a single turning leaf**, which is what forecloses re-proposing a spread-wide sheen
at any later stage.

**The static evidence is explicitly not what decided this.** The spine step it produces is too
small for Andy to see — a valid looking result, and it retired the planner's claim that the
sheen was upstream of the frame.

**Planner correction — necessary is not sufficient.** A per-sheet band painted on the sheet
still rides it like a texture. The band must move *relative* to the surface, and the face must
change luminance through the arc.

### D17 — Round 5, the page turn: T3 at 420 ms
One leaf turns; its reverse **is** the next spread's left page, with cards already in their
pockets — so the turn *assembles* the next spread rather than preceding it.

*Rejected:* **T1** cross-fade · **T2** blank back, which is a lie about the object · **T4**
turns empty and fills on arrival.

**The cost objection was removed by measurement.** All four measured indistinguishable from a
pure opacity cross-fade, with nothing dropped; the figures are in
[design-decisions.md](design-decisions.md).

**Duration 420 ms**, a pure looking decision, since every candidate was legible cold. **Judged
over runs of consecutive flips rather than one turn** — the binder is for browsing, so a slow
turn's cost compounds in a way a single turn never reveals. *The question went unanswered four
times because it was asked badly: "pick a number" without saying what to test.*

**The cold case was a rendering-order question, not a caching one — so there is no preload
scheduler and none is needed.** Turn one's reverse face arrives with the visible spread; turn
two onward receives it when the previous turn completes. **Verified in pixels, not load
events**, against an unpainted face as the control.

**The not-ready placeholder was proposed, measured, then rejected — as was every alternative**
— and then the winner was dropped too, because the state it protected against does not occur.
**Planner error:** the same measurement that proposed the contingency had already ruled out the
thing it was contingent on. *Raised by Andy — he asked when he would ever have a connection
that slow. Decided by the planner.*

**The colour work is shelved, not lost.** The statistic and its measurements are in
[design-decisions.md](design-decisions.md). One finding survives as a constraint on any later
attempt: **"brighter than the page" is not the failure condition** — every card is, and a card
*should* be a bright rectangle. The failure is brighter or darker **than the card.**

**Constraint inherited by Stage D:** any value derived from a card image is catalogue data,
belongs on `card` and not on `holding`, and must be written by the same operation that writes
the image, in the same transaction.

**Amended at Stage C — the card lip stays bright through the turn, and stays.** The lip sits
above the leaf's shading pass, so a card's top-left edge holds full brightness while the page
swings into shadow. Both the planner and Claude Code argued that was a defect, on the ground
that a physical page turning away from a light does not keep bright edges. **Andy looked across
two rounds and did not notice it in use, so it is not one.** Left as built. *Raised by Claude
Code, decided by Andy — looked.* The general form is under *On evidence*.

### D18 — The decision log goes public; the method document does not
This repository is a portfolio piece and this log is the strongest artifact in it. Working code
is table stakes. A record of decisions with the alternatives that lost, positions overturned by
measurement, and errors caught before they cost anything is the part that is hard to fake.

**Andy's method document stays out of this repository and will not enter it.** His position:
proprietary, potentially commercially so.

Ownership transferred at migration: this file is the only live copy, and the copy held outside
is a pointer to it. **Two live copies of a decision record is how they diverge**, and the
divergence is silent until someone acts on the stale one. Currency is enforced by machinery
that already exists — a decision's prompt names the log update as one of its outputs, and the
next prompt's verify section checks it.

**Audited, not assumed.** No reproduction of the method document exists in this repository.
Three passages were flagged and all three stay: the one describing the working arrangement (a
premise, not a method); *"Looked at > Measured > Reasoned"* — **checked against the method
document, which does not contain that formulation, so the ranking originated here**; and the
operating rules, deliberately, because **a rule the executor cannot read is a rule that does
not operate.**

**Every reference to private material was flattened before this shipped**, so no entry points
at a source a reader cannot open. **One could not be made to stand entirely alone:** the
sentence above about the ranking is a claim about the private document's contents, and reducing
it to *"it originated here"* would be the same sentence with its evidence removed. It is left
as a stated check rather than quietly weakened.

### D19 — Stage C is a port, with a machine check under Andy's looking
The question is not *"does the built thing match the design"* but **"does the real stack
reproduce the preview?"** The risk in a port is silent drift.

### D20 — Stage C built: the port, the parity gate, the reconciliation
**Component boundary split on the objects, not the markup.** `Pocket` (well, card, mouth,
reveal, lip; owns hover-and-hold), `Page` (grid plus one sheet specular), `Spread` (board,
spine, stage, leaf, turn). The sheen belongs to `Page` because **the specular is not the
pocket's appearance, it is the sheet's — a pocket is a hole welded into a sheet of plastic.**
Data in `cards.ts` + `types.ts`, so fixtures become a query without touching a component. **Card
images dev-only static, never bundled.**

**The parity gate is two checks, not a tolerance.** An exact zero is unreachable — Chromium
dithers gradients ±1, non-reproducibly between documents, showing as a 122° stripe over the
left sheen with every measurable property identical. So: **gate 1** — every pixel with the
sheen suppressed, 0 differing. **gate 2** — every sheen's box and computed gradient string,
exactly equal. *Stricter than a threshold, because it checks what could actually drift rather
than accepting noise across the region containing it.*

**`tests/visual/parity.mjs`, tracked** — a test, not a preview. It cannot run in CI, and its
header says so and names the demo-dataset route out. **Moving it exposed a bug that had been
silent:** it had been reading captures off a server started by hand, so the gate had been
reporting exact results under conditions nobody had recorded. It now starts and closes its own
ephemeral server, in `finally`, with `fail` defaulting to 1 so anything short of an explicit
pass exits non-zero.

**Andy approved the assembled design on first look.**

**The reconciliation before the push found:**

- **Broken:** four citations. **Three cross-repo references written in bare local form** — a
  `README.md` line range, a `CLAUDE.md` line range and an `app.py` line range, each pointing at
  a different project entirely. **The two that resolve are worse than the one that fails:** the
  `app.py` reference errors honestly here and is self-correcting, while the other two land on
  real, plausible, wrong content in *this* repo and give the reader no signal at all. Plus a
  self-citation off by two, because the file had grown above it.
- **Dead:** `.ctl .lab` with no emitter, an `lslot` class with no rule, three `cards.ts` exports
  nothing imports. The last mattered most — `cards.ts` is the seam that becomes a query at Stage
  D, and a stale export is a false API.
- **Undocumented:** empty. Every hunk traces to a decision.
- **Missing:** empty, **checked at runtime rather than by reading.** Every settled decision
  implemented — empty pockets with the dimmed lit sleeve, ends refusing in both layouts and both
  directions, the directional lip, every scaling item at exactly 2.000, the z-scale at
  1/2/2/3/4/5.
- **Undefended:** five, all now closed or recorded.

**Two things that look dead and are not**, recorded so a future sweep does not remove them:
`/api/health` has no UI caller but is read at startup and used as Playwright's readiness probe;
and **static search cannot see a custom property read through `getComputedStyle`** — `--dur`
appears unreferenced and is read at runtime in `Spread.svelte`, inside `duration()`.

**Three geometry tests, in Playwright rather than Vitest.** *Planner error:* Vitest was the
wrong mechanism — its node environment performs no layout and jsdom resolves no `calc()`, so
both would have **passed on unresolved strings**. Playwright also means they run in CI, which
the parity gate cannot. They assert twelve ratios at exactly 2.000 to five decimals; the reveal
wrapping on the measured worst-case set name; and the z-scale plus a walk to the section
confirming no ancestor creates a stacking context by any of six routes. **Each was proven able
to fail, and to fail only its own test.**

**The card is asserted absolutely while the other eleven are ratios.** *Claude Code's correction
to a planner instruction:* the card at 150 × 210 is not derived from the scaling rule, it is the
decision that cards read at true binder scale — and a ratio test passes happily on a binder of
75 × 105 cards.

**One green is known-fragile.** The wrap test passed on the CI runner with `Avenir Next
Condensed` absent, so the fallback chain reached something narrow enough to still wrap past one
line. That is a pass, not a proof of robustness — **if it ever reddens for no apparent change,
the first question is what fonts the runner has, not what the code did.**

### D21 — A committed preview is evidence, not a mock
The convention was *"throwaway mocks from real material, never committed."* Sixteen were
committed, and `docs/design-decisions.md` cites one by line. That changed their status as a side
effect of a gitignore change, with nobody stating it.

**The rule, narrowed after the reconciliation:** a committed preview may be corrected **only
where the correction cannot change what it renders, and cannot move what any citation points
at.** Dead CSS with no emitter qualifies — verified by screenshot hash, byte-identical before
and after. Anything else becomes a new file. `preview/` is excluded from the formatter, and
**the exclusion protects the citations, not the code style.**

**The convention was already being followed and just had no name:** `round3-page` →
`round3b-proportional` → `round3c-opacity` are three files rather than one revised three times,
because each is the thing that was looked at when a particular decision was taken.

*Planner correction:* the record cites **one** preview file by line, not two. The overstated
version made citation-resolution the primary argument. The real footing is **provenance** —
these are the artifacts decisions were judged against, which is worth version-controlling
whether or not anything cites them yet.

### D22 — Click opens a detail view; hover keeps the bar
**Andy, verbatim:** *"i just want hover for the pages and then the black bar shows up like that
and then when you click on the card it opens a popup that has more info on the card than just
what is appearing in the black box."*

Hover reveals the 90%-opaque panel as it does now. **Click opens something carrying more than
the panel does.**

**Two consequences.** Click-to-hold retires — pinning the smaller thing is pointless once
clicking gives the bigger one. And **touch resolves cleanly**: no hover on an iPad, so tap goes
straight to the full view, which matches what Andy said months ago — *"if it ever makes it to
ipad that's fine it will just be a click on the card to reveal all info."*

**Deliberately unresolved: whether the detail view IS the pull-out.** Andy's first description
of this app was *"you can click on the card and it will pull out of the binder and you can
'look' at it"* — Stage H, the same gesture on the same object. Either the detail view is that,
or one of them has to move. He said this might be future, so it is recorded as Stage H's
specification **with the ambiguity named** rather than resolved on his behalf.

---

## How this project is run

Three parties: Andy, who owns the project and judges by looking at true scale on his own
display; the planner, who writes the prompts; and Claude Code, which builds, measures and
argues.

- **The planner always writes the prompt.** Even something as simple as "push."
- **Uncertainty becomes a question, never a best guess.** Three destinations: resolvable by
  reading a document the planner holds → read it, do not reconstruct from memory; mechanical → a
  verify item for Claude Code, phrased as a question and never as a premise; judgement → Andy.
- **"Assume it comes back green" is permission to proceed, not a report that it landed.**
- **A document that must be on disk is flagged *before* the prompt that needs it**, never inside
  it. Needed **once** → prompt text. Must be **owned, kept current, or re-read** → the repo.
- **When Andy answers "I don't know what I'm looking for," the choice was framed too densely.**
  Explain in plain prose with a concrete example, then re-offer.
- **A pasted Claude Code report does NOT mean Andy has reviewed the preview.**
- **Multiple previews, then pick, then refine.**
- **Claude Code opens previews as part of delivering them**, and re-opens on material change.
- **Rules get reviewed; records get committed.** When a gate is released it is released
  explicitly and said out loud.

---

## Method rules earned the hard way

### On evidence

**Three kinds of knowing, ranked:** *looked at* outranks *measured*, which outranks *reasoned*.
Where a measurement and the looking disagree about whether something **works**, the looking
decides.

**"I can't see a difference" is a looking result, not a failure to see.**

**Physical realism is this design's vocabulary, not its acceptance criterion.** The card lip
holds full brightness while the page swings into shadow, which is not what a page does. Both
tools argued it was a defect on that ground. Andy looked twice and did not notice, so it is not
one. **This is the second time a real, measurable property has been retired by his not seeing
it** — the first was the spine step the per-sheet sheen produces. **The rule is symmetric: a
physically correct detail nobody perceives earns nothing, and a physically incorrect one nobody
perceives costs nothing.** Perception is the currency. *"A real page wouldn't do that"* is a
valid argument pointed at the wrong criterion.

**Whose looking matters.** The hierarchy privileges Andy's eyes specifically.

**Never drop a variant before Andy has seen it.** Twice the argued-against option was the one he
chose.

**"I like it" answers the whole, not the parts.** An approval of an assembled thing does not
close the specific questions its reviewer was asked to rule on.

**Geometry is not UI.** *(Claude Code's formulation, which overturned a planner position.)* For
appearance the looking is the gate and green tests cannot see. But a 2× scaling relationship
across twelve properties, and a z-order across five layers, are **arithmetic** — and arithmetic
is exactly what a person cannot re-verify every round, forever. That belongs to a test.

**A question is a contribution.** The attribution table in the design record gained a `raised by`
column after two rows credited a ruling to the person who had only asked the question.
`decided by` is mandatory — a row that cannot name one is not a decision. `raised by` is
optional.

**Ask the question the way it can be answered.** A question nobody answers is usually a
badly-shaped question, not an absent answer.

**Loaded is not painted.**

**Test the worst case, and check which worst case.** Never compare a tuned option against an
untuned one.

### On tests

**A ratio test defends a relationship; an absolute test defends a decision.** 4-pocket being
exactly 2× 9-pocket is a relationship, and asserting the ratio survives a deliberate base
change. The card at 150 × 210 is not derived from that rule — it is the decision that cards read
at true binder scale, and a ratio test passes on a binder of 75 × 105 cards. **Ask what the
record actually settled before choosing which to assert.**

**A test you have not seen fail is not a test.** Break what it defends, confirm red, revert —
and confirm it fails **only its own** test. Three tests where one break reddens two are two
tests and a duplicate; where a break reddens none, three pieces of decoration.

**Check that the test environment contains the thing being tested.** Vitest's node environment
performs no layout and jsdom resolves no `calc()`, so a computed-style assertion would pass on
unresolved strings. **A green test in an environment that cannot represent the failure is worse
than no test**, because it reports coverage that does not exist.

**Know which greens are fragile.** The wrap test passes on a CI runner lacking the font it was
written against; the fallback happens to be narrow enough. Recorded as known-fragile so that if
it reddens with no code change, the first question is the runner's fonts.

### On instruments

**Measure against this machine's idle floor, never a nominal frame budget.** A frame budget is
arithmetic about a refresh rate; the floor is what the machine actually does when idle, and it
is not the budget. The observed figures are dated in `CLAUDE.md` under *Measure against this
machine's idle floor* — and they are there rather than here because that is a live measurement
that gets taken again. **Measure the floor in the run; do not look it up.**

**A dramatic first result is more likely to be a broken instrument than a broken thing.** Three
instances: an identical over-budget count across four different workloads, which was a nominal
budget being compared against instead of the floor; a phantom long frame during a page turn,
which was the screencast that was measuring it; and a port reported as differing across most of
its pixels, which was two element screenshots taken at different subpixel offsets — the same
port then measured geometrically exact. **The tell, twice, was a result too uniform to be
real.**

**A control is only a control if it can fail.** A page diffed against itself, with the frame
pushed down the document, returned an exact zero and proved nothing, because `scrollIntoView`
had already put both captures at the same viewport position. It looked like evidence and was
inert.

**Detach the instrument.** When a measurement needs pixels, capture pixels in one run and time
in another.

### On records

**The internal-consistency check is not only for reports.** A record whose own numbers do not
add up is falsifiable without leaving the document. **Before trusting a table, add it up.**

**Three numbers in the Round 4 record were wrong, and all three the same mistake:** a value read
from a `:root` base rather than from the variant that was actually judged. **The table contained
its own refutation** — B's 40 px frame cost is only arithmetic at an 18 px spine (11 + 11 + 18);
at the 16 px the table stated, it reads 38. The two numbers sat two rows apart and disagreed for
two rounds, in a document that was public and pushed. It cost one subtraction to catch and
nobody did the subtraction.

**Correct a wrong measurement; keep a wrong argument.** *(Claude Code's formulation.)* A wrong
argument teaches by being kept. A wrong measurement teaches nothing and misleads anyone reading
it as a value. Replace the number; keep the shape of how it went wrong — the shape is the
reusable part.

**When a decision is reversed, sweep every document that recorded it.** A dropped decision
leaves residue wherever it was ever written down, and each copy is a live source for whoever
reads that document next. Twelve-pocket was dropped at D2 and then found alive three times: in a
superseded stage plan, in a prompt that quoted it as "24 slots," and in the public `README.md`.
**The residue outlives the decision unless removal is part of reversing it.**

**A record that cites a file by line freezes that file.** Every tool with write access becomes a
threat to the citation, and the failure is silent: the line still exists, it just says something
else now.

**If a file cannot be frozen, do not cite it by line.** `CLAUDE.md` is edited every round, so a
self-citation by line is guaranteed to rot. Cite living documents by heading and source files by
symbol.

**A cross-repo citation must be visibly not-local.** **A citation that fails is safer than one
that misleads:** a missing file errors and is self-correcting; a present one resolves to
plausible wrong content with no signal at all. A rule that depends on remembering to add prose
will be broken — give it a form instead.

**A document that quotes a bad citation form must describe the specimen rather than reproduce
it, or the quotation becomes an instance.** Found at migration: this log's own account of the
reconciliation had written out three bare cross-repo references verbatim as its examples. In a
private planning document they pointed nowhere. In `docs/` two of them resolve against this
repository's own files — the exact failure the passage was describing. **A specimen and a
pointer are written identically, so the only safe specimen is a described one.**

### On dependencies

**A branch that cannot execute on the development machine is how untested code enters a
project.**

**A tool that only runs from where it was written has an undeclared dependency.** Moving a tool
is a cheap test for whether it stands on its own. **A gate that only works in one place is not
yet a gate.**

**Static search is not a dead-code detector for CSS custom properties** — a property read
through `getComputedStyle` is invisible to grep.

**The reasoning is rarely what fails; the object it is about is.** Planner errors, all valid
arguments pointed at the wrong thing — the scrim covering "the card" when it covers the bottom
third; the boundary coming from the sleeve's surface when it comes from plastic tenting over the
card's own edge; predicting where a sheen's peak lands without working out what that leaves the
*other* sheet; arguing a structure *enables* a behaviour and stopping there; checking a
placeholder's exposure for alpha when the exposure was aspect ratio; and naming Vitest for an
assertion about computed style.

### Failure modes of the system itself

**Three failure modes of a signal, not two:** a run went red · no run appeared · *nothing
arrived*. The third looks identical to the second from outside and needs the opposite
investigation.

**A fourth: the report and the machine disagree, and the report is what gets acted on.** Claude
Code reported the Round 4 design record as "written and held." It had never been written.

*The diagnosis:* **a positive obligation whose success state feels indistinguishable from having
done nothing.** ***It was treated as needing no evidence. It was never beyond evidence.*** One
`git status` on `docs/` would have contradicted it, and so would re-reading the report, which
asserted a clean tree in its first line and an uncommitted file in its last. Nothing hid; nobody
looked.

*Rules that follow:* **stat a file before reporting it written** · **a prompt's verify section
checks the previous prompt's claimed outputs** · **name the location of anything reported as
held, then read the report against itself** · **a positive obligation never goes in a
prohibition list.**

**A fifth, and it belongs to the planner: the summary looks complete.** The planner lost a
prompt it had written to compaction, reconstructed a sequence that skipped it, and escalated a
missing attribution as a possible fabrication. The source was its own instruction.

> **On any question of what was said, Claude Code is the source of truth and the planner is
> not.** *"I have no record of it"* and *"it did not happen"* are different claims, and only the
> first is ever available from a summary. **The independent check is Andy** — he holds the
> session too and can read it without either tool mediating.

**A sixth, on the gates themselves: a verify section must not predict state the prompt itself
changes.** One prompt named an exact HEAD as the precondition for pushing, and an earlier
section of the same prompt moved HEAD. Express it relationally — *"HEAD is the last commit you
made in this prompt; every commit since `<known hash>` is one you can account for."*

> **The gate's value is that it is not interpreted.** A mismatch small enough to explain away is
> exactly where the habit of explaining starts, and the habit is what kills the gate — not any
> single wrong call. Stopping on an obvious arithmetic slip is the gate working. **The cost of
> that stop belongs to whoever wrote the bad verify.**

---

## Open

1. **The missing-image pocket state.** The record defines exactly two pocket states and **both
   are not-owned** — ghost slots (set-completion only; knows *which* card is missing) and the
   tail (does not). An **owned card with no image** is a third case, and rendering it as empty
   makes the interface assert something false about the collection. The live instance is the
   Harper Black Refractor. Recorded in [design-decisions.md](design-decisions.md) under *OPEN —
   a card that is owned and has no image*. Round 6, against the Stage C build. Before Stage F.
2. **Whether an *unverified* image is a distinct state** — asked, not answered.
3. **Does the app declare its font?** Every type decision — the 9 px/7.5 px scrim, the five-line
   wrap on the worst-case set name, "wrapping never truncating" — was settled against **Avenir
   Next Condensed on Andy's Mac.** Fine for him; not obviously fine for a public repo whose
   point is that a stranger can clone it and run the demo. Surfaced by the CI risk analysis
   rather than sought.
4. **Whether the click-opened detail view is the pull-out** — see D22.
5. **Stable slots or pure reflow** — `position` nullable from Stage D; behaviour at Stage G.
6. **Image pipeline language** — Python (Pillow + pillow-heif, proven) or Node (`sharp` plus a
   `sips` shell-out). Verify before Stage F.
7. **Set completion** — a separate mode, not a sort. Unscheduled.

## Debts

- **The stage plan, held outside this repository, still calls Stage C the next thing.** One
  line, at its next revision.
- **Chef's Choice:** the `node --test` glob fix (four sites) and a README documenting a cold
  start that cannot work.
- **This repository's `CLAUDE.md`:** GitHub disables scheduled workflows on public repos after
  60 days of inactivity — the weekly rot-catcher can itself go dormant.
- **A later bound on the turn**, if images ever leave local disk. T3's cold case breaks only
  below roughly 1.5 Mbit, which is not this app on local disk. Deliberately not built.
- **A correct image of the Harper Black Refractor.** Also the live instance of Open 4 — a design
  state, not only a sourcing debt.
- **The demo dataset.** Two reasons: a runnable public demo for a stranger, and the route to a
  parity gate that can run in CI.
