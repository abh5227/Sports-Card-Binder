# Design decisions

The settled visual direction, and **why**. This is the source of record for decisions that
would otherwise live only in planning conversation. Not everything here is settled: entries
marked **provisional** are decided on the best evidence available and expected to be revisited
once the thing exists — see below.

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

| decision                                  | status      | decided by  | how                                  |
| ----------------------------------------- | ----------- | ----------- | ------------------------------------ |
| Bare at rest — nothing added to the card  | settled     | **Andy**    | looked, at true scale                |
| Information on hover rather than always   | provisional | **Andy**    | looked; awaiting real use            |
| The player name stays in the reveal       | settled     | **Andy**    | looked — overruled a measurement     |
| Contextual near-duplicate marking: dead   | settled     | **Andy**    | ruled against both of us             |
| Scrim over rail or side panel             | settled     | Claude Code | built all three, then looked         |
| Area cost at the worst case               | settled     | Claude Code | built it; neither of us predicted it |
| Set-name capacity                         | settled     | Claude Code | measured, 1,210 real names           |
| Specular for occupied, lit for empty      | settled     | **Andy**    | looked — neither of us proposed it   |
| The lit sleeve destroys a card's boundary | settled     | Claude Code | measured, per edge, per treatment    |
| The card's lit edge returns, directional  | settled     | Claude Code | measured a Round 1 deferral false    |
| The bottom edge that no well can fix      | settled     | Claude Code | built two diagnostics to find out    |
| Tight gutter                              | settled     | **Andy**    | looked at three, full page           |
| Empty pocket dimmed to ~40%               | settled     | **Andy**    | looked; confirmed a prediction       |
| Jones's bottom edge is closed             | settled     | **Andy**    | looked — measurement stayed bad      |
| Scrim keeps its 10% show-through          | settled     | **Andy**    | looked; overruled both of us         |
| 4-pocket is 9-pocket at 2×                | settled     | **Andy**    | overruled the planner's scaling rule |
| One sheet of plastic, not nine            | settled     | Claude Code | argued on cost; looks identical      |

### Settled versus provisional — pending real use

**Settled** means decided and not to be reopened without new evidence. **Provisional** means
decided on the best evidence available and *expected* to be revisited once the thing exists.

The distinction exists because **every decision in this file so far was judged on a preview of
nine cards.** Real use means a collection of hundreds, sorted and re-sorted, over weeks. Some
of these will hold and some will not, and the two cannot be told apart from here.

Marking a decision provisional is what makes reopening it cheap. Without the marker, revisiting
a settled-looking decision reads as relitigating something already argued, and the cost of that
appearance is that it does not get revisited at all.

> **Provisional — the hover reveal.** Information appearing on hover rather than always.
> Andy: *"i believe i agree with the hover as well but will see how i like it when implemented
> / after some use."*

Note what is **not** provisional: *bare at rest* was judged by looking at real cards at true
scale, and nothing about a larger collection changes it. Only the *hover* half is pending —
whether reaching for information is right in daily use, as opposed to right on a preview page.

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

## Round 2 — the pocket

**Question:** should the pocket carry the interface's weight, and can it solve the dark-card
boundary Round 1 deferred to it?

**Settled:**

- **Specular-only for occupied pockets.** The well is the page colour exactly. The plastic is
  evidenced only by what plastic does: a raking specular, the mouth where the two films
  separate, welded side seams. Nothing sits between the card and the page.
- **The lit sleeve for empty pockets.** A lifted, graded inner face — the treatment that lost
  everywhere a card was present.
- **The card's own lit edge returns**, and it is **directional**: bright top-left, dark
  bottom-right.

### Why the two states get different treatments — this is not a compromise

The two-treatment answer was Andy's, and neither the planner nor Claude Code proposed it. It is
principled rather than split-the-difference, on two independent grounds.

**The failure mode does not exist in the empty case.** The lit sleeve failed because it
destroyed the boundary *of a card*. An empty pocket has no card. Applying the losing treatment
where the thing it damages is absent is not an inconsistency — it is the scope of the finding
being read correctly.

**It is also what actually happens.** An empty sleeve is two films with air between and the
page showing through. A filled one is opaque where the card is. Light gets through exactly
where a card would block it, so the two states genuinely look different in reality. The
interface is not switching styles; it is rendering two different physical situations.

**And it resolves what the build left unfinished.** The specular-only empty pocket was reported
as *faint, quiet, not yet convincing* — and it was faint **because** it was specular-only. That
treatment is a compromise struck against a card that is not there. The lit well is right for
the one case where nothing competes with it.

### The limit of the two-state answer — it addresses the boundary, not salience

Recorded here, beside the decision, because Round 1 set this precedent with *the limit of that
defence*: **a decision recorded without its known limit is how a future session inherits a rule
whose justification quietly fails.** A reader of this decision must meet the limit here, not
three sections later.

**The two-state answer is correct on the question it was chosen to settle.** The lit sleeve
failed because it destroyed the boundary *of a card*; an empty pocket has no card. That argument
holds and nothing below weakens it.

**Salience is a separate axis, and the argument does not reach it.** In the four-pocket cluster
the lit empty pocket was the brightest object on screen — the eye went to the hole rather than
to the cards. That has nothing to do with whether a card is present, so the reasoning that
licenses the two-state answer leaves it entirely untouched.

**The inversion is the case to watch.** Twenty cards at 9-pocket leaves a last page of two cards
and seven empties. Seven lit pockets and two cards could read as *a page of empties with two
intruders* rather than as a page with a tail — the emptiness announcing itself instead of the
collection.

**Andy saw this before it was written.** It was put to him as a caveat against his own call
rather than recorded on Claude Code's authority, and he ruled it in — here as a limit, and again
as a Round 3 carry, on the grounds that a real page is where it can actually be settled.

> **The planner's proposed resolution — reasoning, and therefore the weakest kind of entry in
> this file.** The lit sleeve was tuned against a lone pocket in isolation, where it had to be
> bright enough to register with nothing around it. Surrounded by cards it needs far less. On
> that reading this is a **calibration performed in the wrong context**, not a wrong treatment,
> and Round 3 on a real page is the right context to tune it in. Nothing has been built to test
> this; it is an expectation, not a finding.

### The lit sleeve destroys the boundary it was built to create

Rendered boundary step, near-black card (Jones, 2023 Panini Prizm Blue Wave), measured per edge
from the rendered pixels at true scale:

| treatment     | left       | bottom | top        |
| ------------- | ---------- | ------ | ---------- |
| no sleeve     | **3.37:1** | 1.15:1 | 3.48:1     |
| film          | 3.24:1     | 1.12:1 | 3.34:1     |
| lit sleeve    | 2.16:1     | 1.01:1 | 3.48:1     |
| physical      | **1.89:1** | 1.01:1 | 4.85:1     |
| specular only | 3.27:1     | 1.14:1 | **6.42:1** |

**The lit inner face makes the dark card worse, in proportion to how lit it is.** The model was
upside down, not mistuned. Jones's left edge is L 0.146 — *brighter* than every well built, so
lifting the well moves it **toward** the card and closes the gap rather than opening one.

Raising the well also costs the light-bordered card: Durant's left boundary falls from 11.33:1
to 6.28:1. No visible harm at that magnitude, but the direction is the same for every card
brighter than the well, which is nearly all of them.

### The bottom edge cannot be fixed by any well

1.15:1 with no sleeve, 1.01:1 at full strength, 1.14:1 with the card's drop shadow removed. Two
diagnostics were built specifically to find out why, and the answer is not tuning:

> **Light from the upper left puts shadow exactly where the lit surface was needed.**

The bottom edge is the shadow side by construction. A lit well cancels there no matter how
bright it is. This is a property of the light direction, not of the treatment, so no setting of
this mechanism reaches it.

### The Round 1 deferral was wrong, and it was measured wrong

Round 1 deferred the card's own lit edge on the theory that the pocket would supply it. **The
pocket cannot.** The only edge any sleeve improved was the top, and that improvement came from
the *lip* — a line on the card's own edge — not from the well. A diagnostic with the well set
to the page colour exactly beat every lit sleeve on every measurement.

**The lit edge returns, with one qualification that saves most of the original worry.** It must
be **directional** — bright top-left, dark bottom-right — not a uniform stroke. A uniform
control was built to test precisely this and lost even on the dark card (3.13:1 against 3.48:1
at the top edge).

Directionality is what buys **artwork-adaptivity for free**, which is what the Round 2 principle
demanded. On a white-bordered card the bright top-left line lands on cream and vanishes; no
doubled edge appeared in any treatment. A uniform stroke would have to be tuned against artwork
it cannot see, which is the fault the principle was written to prevent.

### Three places, not two — the corrected rule

The planner's position going into Round 2 was that interface weight belongs **outside** the card
boundary, because the page is controlled and the artwork is not. Half of that is right, and the
dichotomy is missing its most useful term.

Right: **nothing should sit between the card and the page.** Every well built degraded every
card, and the degradation scaled with strength. That is now measured rather than asserted.

> There are **three** places, not two: **over the artwork**, **on the boundary**, and **out on
> the page**. The lip is the third, and it is privileged — it is the only one that is about the
> *relationship* between card and page rather than about either side.

**And "constant by construction" is false.** A boundary is a **ratio**, so a constant term on
one side of it is not constant in effect. Lifting the well from L 0.008 to 0.055 is a fixed
absolute change; it takes the dark card's left boundary from 3.37:1 to 1.89:1 and the light
card's from 11.33:1 to 6.28:1. The page you control is one operand. The artwork you do not
control is the other, and it is always in the expression.

### Premise corrections found by measuring before building

All three were carried in good faith from earlier rounds and all three were wrong:

- **Crosby is not a near-black card.** Its border is silver, L 0.54–0.64, an 11.7:1 step against
  the page. What is dark is its *bottom third* — which is why it was the right card for the
  Round 1 scrim test and the wrong one here. Same card, different region, different question.
- **Nash and Judge carry crop-defect black on two edges each** — retained scan background at
  L 0.003. That is a sourcing artifact, not a card property, and it inflates their measured
  dissolve to ~50% of perimeter. Judging a sleeve against those is judging it against a bar of
  black. Both were excluded.
- **Real dissolve is 2 of 7 clean images, and never a whole outline.** Jones at 20% of perimeter
  below 1.5:1 against the page, McGaffigan at 12%, the other five at 0%. The problem is real and
  it is *partial* — worth fixing, not worth over-fitting to.

> **CORRECTED 2026-08-19 at Round 3. The second and third bullets above are half wrong. They
> are kept as written, because the point of this file is to show how conclusions moved.**
>
> **Nash was genuinely defective.** 21 rows of retained scan background at the bottom, 14
> columns at the right. Re-cropped, its dissolved perimeter falls from **52% to 3%**.
>
> **Judge never was.** Its dark top and right are the card's own navy Bowman keyline. Its light
> left and bottom are the card's white border showing because **the cut is off-centre** — a
> normal physical property of a trading card, and one a real collection is full of.
>
> **Why the error, which is the reusable part.** The Round 2 detector took the **mean RGB** of
> each edge and converted that to luminance. That statistic collapses three different things
> into the same suspicious number: a genuinely dark border, a bright border, and a bar of scan
> background. A **percentile** test separates them, because a scan bar is a line where *almost
> every* pixel is black rather than one whose average is low — `p95 < 0.012` across the line.
> Reach for a percentile whenever the question is *"is this line uniformly X"* rather than
> *"what is this line on average"*.
>
> **Corrected figure: 3 of 9 genuinely dissolving, not 2 of 7.** Judge at **49% of perimeter**
> is worse than anything Round 2 believed was real.
>
> **This does not reopen Round 2.** More dissolve than believed strengthens the case for the
> directional lip rather than weakening it, and the sleeve decision was Andy's on separate
> grounds — the failure mode does not exist in an empty pocket, and the two states differ
> physically. Nothing above depended on the dissolve being small.

### The z-order rule

Found only with the reveal and the sleeve edge on screen at once, and findable no other way: the
card's lit edge stopped where the reveal started, so a card's boundary was continuous on three
sides and interrupted for the bottom 30% of the fourth — precisely on the dark cards where it was
doing the work.

> **The card's edge is the card's. The reveal is a label laid inside it, and a label never
> truncates the object it labels.**

Applies to anything later drawn within a card's bounds, not only the reveal.

---

## Round 3 — the page

**Question:** how do nine pockets sit on a page, and what does the second layout do?

**Settled:**

- **Gutter: tight.** 2px between pockets, which is 16px card-to-card once the 7px sleeve inset
  is counted on both sides.
- **Empty pocket: dim.** `#20242A`, highlight .06, rim .085 — about 40% of Round 2's lift.
- **One sheet of plastic, not nine speculars**, with the z-scale below.
- **4-pocket is 9-pocket at 2×.** Proportional in geometry *and* type, scrim at full card width.
- **Scrim opacity stays at 90%,** and the show-through is a deliberate property.

### Why the gutter counter failed

The counter was that cards nearly touching would read as a wall of colour, and that breathing
room was what would make a page legible. Three widths were built at full page with nine real
cards, everything else identical.

> **Space around a loud object does not quiet it.** Junk-wax commons are exactly as loud at a
> 22px gutter as at 2px. The gutter was never the lever for legibility, because legibility was
> never gutter-limited — every card carries its own border and sits on a near-black page, and
> 16px of `#171A1F` is already a decisive separator.

What the gutter actually changes is **whether the page reads as a sheet with pockets or as a
grid of separate items.** At 22px it becomes a gallery grid and the binder premise quietly
evaporates. At 2px it is a sheet.

**Physical arithmetic agrees, and would have led if it had been done first.** A real 9-pocket
page is about 9″ wide holding three 2.5″ cards, leaving roughly 1.1″ for two gutters and two
margins — **9–15px card-to-card at this scale.** Tight at 16px is already at the loose end of
accurate; the middle setting was wider than any real page.

### The empty pocket — the mechanism is area, not luminance

The planner's prediction was recorded at Round 2 as *reasoning, and therefore the weakest kind
of entry*: that the lit sleeve had been tuned against a lone pocket and would need far less
brightness surrounded by cards. **It was right**, and by a mechanism the prediction did not
name.

At Round 2's setting the six empties of a three-card tail form a single grey slab across two
thirds of the page and the eye goes straight to it — at only 20% of a card's mean luminance.

> **Calm beats bright at scale.** Six contiguous empty pockets are a large *uniform* region
> while the cards are busy and broken up, so the empties win the page on area rather than on
> brightness.

**This is why a lone pocket could never have predicted it: a lone pocket has no area to
accumulate.** There is also a floor — at the dimmest setting tested the lattice disappears and
the page loses its structure.

### The sheen — decided on cost, because appearance could not decide it

Round 2 gave every pocket its own copy of the specular, because Round 2 only ever tested one
pocket. Nine identical highlights in identical relative positions is not what a sheet of plastic
under one light does, and **it is invisible until nine pockets are on screen at once.**

**Andy looked and could not tell the two apart**, so the decision was taken on cost.

**Cost to build is a wash.** One element in the page against one in each pocket; DOM count is
irrelevant at this scale.

**Cost to live with is decided by the re-order.** FLIP-style reflow is this application's
central interaction — cards animate between positions whenever the sort changes. With
per-pocket speculars, **nine highlights fly across the page on every re-sort.**

> **Light does not move when objects move.**

One sheet stays put and the cards travel under it, which is what happens. This is a code
argument rather than an aesthetic one: per-pocket would have to suppress or special-case the
specular during animation, which is more code than the single element it saved.

The lift-out interaction is the same shape. A card lifted out of its pocket is a card out of its
sleeve and should carry no specular; with one sheet it does not, for free.

### Why this does not violate component ownership

The objection is that a `Pocket` ought to own its own appearance, and a page-level sheet breaks
that.

**It loses, and the reason is worth keeping.** The specular is not the pocket's appearance — it
is the **sheet's**. A pocket is a hole welded into a sheet of plastic. The component boundary
should follow the object, and here it does: the sheet owns the specular, the pocket owns the
pocket. The coupling is real, and it runs in the right direction.

### The z-scale — recorded once, because the coupling spans two components

One sheet means a page-level element must sit **above** every pocket's plastic and **below** the
hover reveal. That ordering cannot live inside either component alone, so it lives here:

| layer          | z-index | owned by |
| -------------- | ------- | -------- |
| well           | 1       | pocket   |
| card           | 2       | pocket   |
| mouth          | 2       | pocket   |
| sheet specular | 3       | page     |
| reveal         | 4       | pocket   |
| lip            | 5       | pocket   |

Two rules are encoded in that order and both were found the hard way:

- **UI sits above the plastic.** The reveal is above the specular, or a highlight washes across
  the text.
- **The card's own edge sits above the label.** The lip is above the reveal — the Round 2
  z-order rule, that a label never truncates the object it labels.

**Do not give a pocket its own stacking context.** Isolating it would lift the page's specular
above everything inside the pocket, including the reveal, and re-break the first rule.

### 4-pocket is a different job, and it is the easier case

Nine is browsing; four is display. The cards get bigger rather than the page getting smaller,
and at 2× it reads as a different job rather than as a zoomed-in nine.

**One rule: 4-pocket is 9-pocket at 2×.** Card, sleeve inset, gutter, page margin, scrim
padding, scrim type, hairline and lip all scale by the same factor. 9-pocket is unchanged by
construction. This replaced a proposal that the scrim be a UI element of *constant* width — that
proposal is dead, and it was what made the panel read as a bar three-quarters empty.

**The panel feels better at 4-pocket, which inverts what was assumed going in.** The worry was
that covering a third of a card you are deliberately examining would feel worse than covering a
third of one you are skimming. It is the other way round: at 4-pocket a third of the card buys
text you read effortlessly; at 9-pocket the same third buys text you squint at. **That makes
9-pocket the harder case, not 4.**

### The scrim's 90% is deliberate — do not "fix" the doubled name

At 2× the artwork behind the panel is also 2×, so the 10% that comes through becomes legible.
Its most visible instance is **a card's own nameplate sitting behind the panel — Crosby at
4-pocket, where *Sidney Crosby / Penguins · Center* reads clearly beside `GOLD` and `/25`.**

> **Both Claude Code and the planner read that as a rendering mistake and proposed removing it.
> Andy looked at exactly that case and kept it.** The show-through is not a defect being
> tolerated; it is translucency doing its job. The card has not gone anywhere underneath the
> label, and at full opacity it genuinely disappears in that region.

**If you are here because you saw a doubled name and reached to fix it: this is the sentence.
It was chosen. Leave it.**

### The Jones bottom edge — closed by looking, with the measurement left bad

Round 2 carried this forward on a proposed mechanism: that in a grid, a dark card's bottom edge
sits above the next card's bright top lip, so the neighbour would supply the boundary.

**The mechanism fails.** Measured on a full page, Jones's bottom edge is **1.04:1** against what
is under it, and **1.09:1** against the neighbour's lip 16px below. At that distance the lip
reads as *the top of the next card*, not as the bottom of this one. What the grid does supply is
a faint line 9px down — the next pocket's mouth at 1.63:1 — which is the pocket lattice, not the
card's boundary.

**It was closed anyway, by Andy looking.** On a real page Jones reads as a complete card,
because three of its four edges are resolved and its interior is bright against a dark page. The
measurement stays bad and the perceptual failure does not appear.

> Claude Code had already closed this on its own looking. **It is recorded as closed on Andy's**,
> because the hierarchy at the top of this file exists to privilege his and would be worth
> nothing if it were quietly bypassed the first time the two happened to agree.

**The limit is kept: not-observed, not proved-absent.** The case that would bite is a card dark
at the bottom *and* dark throughout, with no bright interior to anchor it. None of the nine test
images is that card. **One exists in Andy's collection — the 2012 Topps Chrome Harper Black
Refractor** — and is absent from the test set only because the scraper returned the wrong card
for it. When that image is sourced, look again.

### Banding — real as an appearance, and nothing to do with the edge treatment

The risk carried from Round 2 was that a bright top and dark bottom repeated down three rows
would read as horizontal banding.

Row-top against row-bottom mean luminance differs by +0.070, +0.007 and +0.045 down the three
rows — but that tracks **card design**, not the lip. Cards are top-heavy by convention: logos
and team names at the top, nameplates at the bottom. A 1px directional line cannot move a
twelve-row mean by 0.07. **The appearance is real and it is the cards'. Nothing to fix.**

### The method rule — one element, two failure modes, opposite worst cases

This generalises well past the scrim and is the most reusable thing in the round.

A translucent panel can fail in two unrelated ways, and **the worst case for each is the
opposite of the worst case for the other**:

- **Leak** — artwork showing *through* — is worst over **busy or high-contrast interior**.
- **Reading as a hole punched in the card** is worst when the panel is **surrounded by bright
  artwork**, because a dark rectangle cut into a light card is the picture of a window.

The hole test was built on a dark card, on the reasoning that a dark panel might merge with dark
artwork. That is the *mild* case: a dark panel on a dark card has barely any contrast across its
own boundary, so it cannot read as a hole in either direction — **it is mild precisely because
the two things are similar.**

> **When testing whether an element reads as sitting ON something, the worst case is maximum
> contrast at its edge, not minimum.** And when an element has two failure modes, pick a card
> for each. **Testing both on one card is how you end up testing neither.**

A postscript worth having: on the light card both modes peaked together — Durant's own nameplate
ghosts *more* visibly than a dark card's, because it ghosts bright. Two failure modes with
opposite worst cases can still share a card; it just cannot be assumed.

---

## Carried forward

The Round 1 entries below are kept **with their original reasoning intact** so that the
prediction and the outcome can be read against each other. Neither was edited after the fact.

### Resolved at Round 2 — the card's own lit edge

Dark-bordered cards dissolve into the surface behind them; their edges stop reading. A 1px
lit hairline on the card was proposed and **deliberately not built**.

The theory for deferring: a real card does not dissolve into a real binder page **because of
the pocket** — the sleeve's specular edge is where the boundary physically comes from.
Adding an interface edge now risks carrying a redundant one forever.

**If the sleeve does not fix it, the hairline returns with evidence.**

> **Outcome: the sleeve did not fix it, and the reasoning above is wrong at its centre rather
> than at its margin.** It named the sleeve's specular edge as the source of the boundary. The
> source is the plastic **tenting over the card's own edge** — a line *on* the boundary, not a
> surface beside it. Everything the deferral then concluded followed correctly from a premise
> about the wrong object. The lit edge returns, directional. See **Round 2 — the pocket**.

### Resolved at Round 2 — the interface's weight must not depend on the artwork

Two instances of the same fault are already on record, pointing opposite ways:

- the **scrim** reads heavy and assertive over light cards, and nearly vanishes over dark
  ones (the hairline fixes the boundary, not the weight);
- the **card edge** has the inverted problem — invisible where the artwork is dark, redundant
  where it is light.

Whatever the pocket does, it should hold roughly constant apparent weight across a chrome
refractor, a matte common and a black-bordered modern card.

> **Outcome: the principle held and the proposed means of satisfying it did not.** No fixed
> well can satisfy it, because a boundary is a ratio. What satisfies it is **directionality** —
> a bright top-left line lands on cream and vanishes, lands on black and does the work, with no
> knowledge of the artwork required. See **Three places, not two**.

### Carried to Round 4 — two kinds of empty pocket

> **Still open after Round 3.** Round 3 settled how an empty pocket *looks*; this entry is about
> what it *says*, which was never a treatment question.

Both get the lit sleeve, now at the dimmed setting. They differ **only in labelling**, which is
not a treatment question. Agreed with Andy.

- **Ghost slots** — cards in a set's checklist that Andy does not own. **Set-completion mode
  only.** Andy's rule, and it independently confirms the earliest design finding that ghost
  slots contradict binder order. In every other sort there are no blanks; cards pack.
- **The tail** — 20 cards at 9-pocket means the third page holds two cards and seven empty
  pockets. This happens in *every* mode, because a binder page has nine pockets whether or not
  they are full.

**A ghost slot knows which card is missing. A tail pocket does not.** That difference is the
whole of the labelling problem.

### Resolved at Round 3 — the unresolved bottom edge

Dark cards' bottom edges measure 1.14:1 against the page in the settled treatment, and no well
can improve it. The open question is whether the **grid** supplies it: on a full page, a card's
bottom edge is adjacent to the *next row's top lip*, which is the bright side of the
directional edge.

Not testable on a single pocket. If the grid does supply it, nothing more is needed; if not,
the bottom edge needs its own answer.

> **Outcome: the grid does not supply it, and it was closed anyway.** Measured 1.04:1 at the
> edge and 1.09:1 against the neighbour's lip. Andy looked and the card reads as complete. See
> **The Jones bottom edge** above, including the limit and the card that would test it.

### Resolved at Round 3 — banding risk from the directional edge

Bright-top and dark-bottom on every card, repeated down three rows, may read as **horizontal
banding** across the page rather than as per-card lighting. The cue that works in isolation is
the cue that repeats, and repetition is what a page adds.

> **Outcome: the appearance is real and it is not ours.** It tracks card design being top-heavy
> by convention, not the lip. Nothing to fix.

### Resolved at Round 3 — salience of the lit empty pocket

The stated limit of the Round 2 decision, carried to where it can be settled. On a page, does
the lit empty pocket sit quietly among cards, or does it pull the eye to the gaps? And does the
last page of a set invert — seven lit pockets and two cards reading as a page of empties?

**Tune the empty pocket's brightness on a real page, not on a lone pocket.** The current setting
was calibrated in isolation, where it had to be bright to register at all. Settled together with
the entry below, which is the same test from the other side.

> **Outcome: retuned to ~40% of Round 2's lift**, and the mechanism turned out to be **area, not
> luminance**. The inversion worried about — a last page reading as empties with two intruders —
> does not appear at the dimmed setting.

### Resolved at Round 3 — test a partly-filled page, not a single empty pocket

Every empty-pocket judgement in Round 2 was made on one pocket alone, or a cluster of four. A
single faint pocket reads as noise; nine read as structure. **The empty-pocket treatment is not
finally judged until it is seen on a real page with some pockets filled and some not.**

> **Outcome: done — three cards, six empty.** It is the test that produced the retune, and the
> reason the Round 2 setting could not have been right.

### Resolved at Round 3 — the long-case overhang, and P4

The long-case scrim could overhang a few pixels **below** the card into the pocket margin,
which would hold the covered *area* of the card roughly constant regardless of line count.

This needs a gutter deep enough to receive it — the same constraint a gutter-placed reveal
would need. **A thing to check when page layout is designed, not a design to build now.**

> **Outcome: both are dead, killed by the tight gutter.** Neither has room at 2px. P4 — the
> reveal placed in the gutter below a hovered card — was only ever an alternative to the scrim,
> which won at Round 1. The overhang was for the 4.2% case, which wraps to five lines and
> survives without it; confirmed on a full page.

### Carried to Round 4 — the spine gap depends on the page gutter

The tight gutter sets the scale everything else is read against. Whatever separates the two
pages of a spread will read as a large break by comparison, which is probably right — a real
binder has a spine — but **the number is not independent** and should be chosen against 2px
rather than in isolation.

### Carried to Round 4 — the page margin is uniform, and a spread's is not

The 18px margin is the same on all four sides. On a spread the inner margins face each other
across the gutter and the outer ones do not. Round 3 fixed a single number for a situation that
has two.

### Carried to Round 4 — one sheet, across two sheets

Choosing one specular per page makes this specific rather than open: **a spread is two physical
sheets under one light.** The sheen should therefore be continuous in **direction** while
restarting at each sheet's surface. Whether that reads as one gradient across the spread or two
aligned ones is the thing to build — and it is a question that did not exist before Round 3.

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
