# Design decisions

The settled visual direction, and **why**. This is the source of record for decisions that
would otherwise live only in planning conversation.

Conclusions without their reasoning get re-litigated by whoever next thinks the code looks
wrong. So every entry here carries the argument, the alternatives that lost, and — where
one exists — the limit of its own justification.

Decision numbering (D8, D9, D12 …) is owned by the planning thread, not by this file. Where
a numbered decision is referenced it is named as such; nothing here mints new numbers.

---

## How these decisions were made

**Who decided, and by what method, is part of the record.** Six months from now these are
not equally re-openable, and a future session needs to know which kind of decision it is
about to argue with.

Three kinds, in descending order of how much weight they carry:

- **Looked at** — Andy, at true scale on his own display. This is the gate no tool can
  perform, and it outranks the other two.
- **Measured** — built and instrumented. A number, not an opinion.
- **Reasoned** — argued from principle without building. The weakest kind. This file
  contains one that was confidently wrong.

| decision                                | decided by  | how                                  |
| --------------------------------------- | ----------- | ------------------------------------ |
| Bare at rest, information on hover      | **Andy**    | looked, at true scale                |
| The player name stays in the reveal     | **Andy**    | looked — overruled a measurement     |
| Contextual near-duplicate marking: dead | **Andy**    | ruled against both of us             |
| Scrim over rail or side panel           | Claude Code | built all three, then looked         |
| Area cost at the worst case             | Claude Code | built it; neither of us predicted it |
| Set-name capacity                       | Claude Code | measured, 1,210 real names           |

**The name in the reveal is the entry worth understanding.** A measurement found 7 of 9
player names legible on the card itself at 150 px, which argued for leaving the name out as
redundant. Andy overruled it by looking. Those are two different bars:

> *"can I resolve these letters"* — which the measurement answered — versus
> *"would I actually read this while flipping"* — which it did not.

**The second bar won, and it is the right one.** A name that is technically resolvable but
that nobody reads in motion is not doing the job. Where a measurement and the looking
disagree about whether something *works*, the looking decides; the measurement is evidence
about what is on screen, not about what gets used.

**Two entries went against whoever proposed them**, which is the point of building things:

- Claude Code would have shipped the **fixed rail** on reasoning alone. Building all three
  and looking flipped that position to the scrim.
- **Contextual near-duplicate marking** was proposed by Claude Code and entertained by the
  planner. Andy killed it against both of us, and was right — see the dead-idea entry below.

---

## Round 1 — the card

**Question:** what, if anything, should the interface add around a card?

**Settled:**

- **Bare at rest.** No frame, no mat, no caption, no badges. A trading card is already a
  finished designed object; at 150 × 210 CSS px there is no room to add anything that does
  not compete with design work someone already did properly.
- **Scrim on hover.** Information appears over the foot of the card on hover, and is held
  open on tap for touch.
- **Flat panel with a 1px top hairline** at `rgba(232,228,220,.18)`. Not a gradient — see
  below.
- **Content: `name · year+set · parallel · serial`.** Four lines carrying five facts.
- **Wrap, never truncate.**

### Why the scrim beat the alternatives

Three placements were built and looked at, with identical content, typography and card set
so that only placement varied.

**A side panel beside the card lost on measurement, not taste.** Hovering a centre card put
the panel over roughly **45% of its neighbour** — logo and head, not a graze. Cards in the
right-hand column had to flip the panel to their left to stay inside the frame, so the panel
appeared on different sides depending on which card you hovered. That destroyed the one
thing the placement was buying: it was supposed to remove eye travel, and instead you could
not predict where to look. It also read as floating UI rather than part of the object.

**A fixed rail in the page frame lost on standing cost.** It never occludes anything, which
is a real advantage. But it reserves a permanent band that is empty most of the time, and
the band is **oversized even when full** — only 2 of 9 sample cards carry a serial and 4 of 9
a parallel, so the five-line maximum it reserves for is the uncommon case. It can only ever
show one card. And it would need re-siting the moment a two-page spread exists: the rail
either duplicates or moves to the gutter, and either is a new decision.

### The single-page test — apply this, do not just remember it

That last point generalises past this round:

> **Any Round 1 or Round 2 choice that assumes a single page will be re-opened at Round 4.**

Before settling a treatment, ask what it becomes on a two-page spread with a gutter. A
choice that has to be re-decided there is one you are paying for twice. The scrim passes
because it is attached to the card and travels with it; the rail failed because it was
attached to the page.

### The planner's error, kept on purpose

The scrim was initially ruled out by reasoning, before anything was built:

> *"it hides the card at the moment you most want to compare text against picture — 'is this
> the purple one' needs both at once."*

The reasoning was sound and the conclusion was wrong, because it **mislocated the geometry**.
A parallel's visual signature — Blue Wave's ripple, a purple refractor's frame, chrome's
rainbow — lives in the border and background, i.e. the **top ~70%** of the card, which the
scrim leaves untouched. The scrim covers the **bottom ~30%**, which is the nameplate and set
logo: the information the reveal is reprinting two millimetres away.

Kept because it is a good example of a whole class of error. The risk identified was real;
the location was assumed. That only surfaced by looking.

### The limit of that defence — it does not extend to the worst case

The "it only covers redundant nameplate" argument **holds at three or four lines and fails at
the extreme.** With the longest real set name in the sample the panel reaches **~40–48% of
the card and lands on the subject**, not on the nameplate region.

This is rare — **4.2% of 2015-onward sets, 0% of pre-1990** — and it is not a reason to
reopen the decision. It is recorded because a future session should inherit the *reasoning
and its boundary*, not a rule whose justification quietly fails at the edge and leaves
someone defending it in a case it was never argued for.

### Wrap, never truncate — and where truncation is forced

Set names **front-load the manufacturer and back-load the distinguishing part**. "Upper Deck"
is shared by hundreds of sets; "Tim Hortons Team Canada Gold Medalist" is what makes this one
*that* one. Truncating from the end removes precisely the informative half:
`UPPER DECK TIM HORTONS TEAM CAN…` identifies nothing.

So in the scrim, the panel grows by a line instead.

> **Where truncation is genuinely forced** — a narrow column at card entry, a fixed-width
> table — **truncate from the front or the middle, never the end.**

This applies anywhere set names are displayed, not only here.

### Why year and set merged onto one line

`1988` alone occupied a whole line for four characters. `1988 · TOPPS` recovers a line on
**every** card, not just long ones — vintage 3→2 lines, typical 5→4, worst 6→5. It also
improves the wrap point in the worst case for free.

The better reason is not the line count: **nobody says "Panini Prizm, 2023".** Year and set
are read as one phrase, so they are set as one phrase.

### Why the gradient had to go

The scrim originally faded in from transparent at its top edge. Over a dark card it had no
boundary at all — dark panel on dark card, text floating with nothing under it.

The fix is a hairline, and **a hairline drawn on a fading edge floats above nothing** — the
line has to sit on a hard edge. So fixing the boundary meant committing to the scrim being a
*panel* rather than a wash. That is a small change of character and a good one: a label laid
on a card is more subject-grounded than a wash poured over it.

### Dead idea — contextual marking of near-duplicates

An earlier proposal was to mark cards only when two near-duplicates share a page, to
distinguish parallels of the same base card.

**It solves a problem that does not exist.** A parallel is *visually* different by
definition — an orange Durant is orange, a Black Refractor is black. That is exactly why
`parallel` lives on the **card** row rather than the holding: the image belongs to the print.
Do not build it.

---

## Carried forward

### Deferred to Round 2 — the card's own lit edge

Dark-bordered cards dissolve into the surface behind them; their edges stop reading. A 1px
lit hairline on the card was proposed and **deliberately not built**.

The theory for deferring: a real card does not dissolve into a real binder page **because of
the pocket** — the sleeve's specular edge is where the boundary physically comes from.
Adding an interface edge now risks carrying a redundant one forever.

**If the sleeve does not fix it, the hairline returns with evidence.**

### Principle for Round 2 — the interface's weight must not depend on the artwork

Two instances of the same fault are already on record, pointing opposite ways:

- the **scrim** reads heavy and assertive over light cards, and nearly vanishes over dark
  ones (the hairline fixes the boundary, not the weight);
- the **card edge** has the inverted problem — invisible where the artwork is dark, redundant
  where it is light.

Whatever the pocket does, it should hold roughly constant apparent weight across a chrome
refractor, a matte common and a black-bordered modern card.

### Carried to Round 3 — the long-case overhang

The long-case scrim could overhang a few pixels **below** the card into the pocket margin,
which would hold the covered *area* of the card roughly constant regardless of line count.

This needs a gutter deep enough to receive it — the same constraint a gutter-placed reveal
would need. **A thing to check when page layout is designed, not a design to build now.**

---

## Set-name lengths — a property of the CATALOGUE, not of this design

Recorded here because it was measured here. It is not a design decision, and it will matter
again anywhere set names are displayed: card entry, search results, exports, fixed-width
columns.

**Migrates to the data documentation at Stage D.**

1,210 real set names, four sports, 1952–2026.

|                        | n    | median | p90 | p95 | max |
| ---------------------- | ---- | ------ | --- | --- | --- |
| all                    | 1210 | 15     | 27  | 30  | 48  |
| pre-1990               | 79   | 5      | 10  | 10  | 13  |
| 1990s                  | 103  | 9      | 16  | 22  | 39  |
| 2015 onward            | 977  | 17     | 28  | 31  | 48  |
| hockey (longest sport) | 304  | 18     | 30  | 36  | 48  |

- **Set names inflated roughly 3× between the 1980s and now** — median 5 characters pre-1990
  against 17 from 2015 onward; longest 13 against 48.
- **Hockey runs longest** at every percentile, driven by Upper Deck's long insert names.
- At 7.5px condensed with 0.10em tracking, **32 characters fit** in 134px. **96.4%** of sets
  fit one line; the worst measures 195px — 1.46 lines, so two, never three.

**Two limits on these numbers, both load-bearing:**

- **The sample skews modern.** 977 of 1,210 are 2015 or later, because that is what a price
  site lists. The all-sets median of 15 is therefore modern-weighted. For a mixed vintage and
  modern collection **the era rows are the useful ones**, not the total.
- **The strings are reconstructed from URL slugs**, so casing and punctuation are inferred.
  Lengths are sound — length is what was measured — but **the names are not canonical
  catalogue data** and must not be treated as such.
