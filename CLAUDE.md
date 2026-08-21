# CLAUDE.md

Guidance for Claude Code working in this repository. Read this before doing anything.

## What this is

A personal sports-card collection app. Four sports — baseball, basketball, football,
hockey. No trading-card games. Single user, local, offline-capable, intended to grow to
a few thousand cards.

The interface is a **binder**: card images sitting in pockets on a two-page spread you
flip through, re-orderable by player / set / year, where clicking a card lifts it out of
its pocket for a closer look. Pocket layouts of 4, 9 and 12. Cards render at roughly
150 × 210 CSS px — true binder scale, not a gallery of giant cards.

It is an **idealised** binder. Every card renders identically in a pocket. Graded slabs,
magnetic one-touch holders and other physical storage are not modelled, and the app does
not track where a card physically lives.

## Read this too

- [`docs/design-decisions.md`](docs/design-decisions.md) — the settled visual direction and
  the reasoning behind it, including the alternatives that lost and the limits of the
  arguments that won. Read it before changing anything about how a card **or its pocket** is
  presented. It marks which decisions are **provisional** — do not treat those as fixed.

---

## Where things live

**Code lives here. Data does not.** This repository is public; the collection is
personal and irreplaceable. They never share a directory.

|                | Location                                               |
| -------------- | ------------------------------------------------------ |
| Repository     | `~/Developer/Sports-Card-Binder`                       |
| Data directory | `$BINDER_DATA_DIR`, default `~/Developer/binder-data/` |

`BINDER_DATA_DIR` holds the SQLite database, cached card images and any exports. It is
an **environment variable with a default, not a hardcoded path** — the app must never
assume its data lives inside its own folder. Anything that resolves a data path goes
through the one resolver; nothing else builds paths by hand.

---

## The data must never live inside an iCloud-synced tree

`~/Documents` and `~/Desktop` on this machine are **live iCloud file-provider domains**
(`com.apple.Dataclass.CloudDesktop` is active) with **Optimize Mac Storage enabled**.
That combination is actively hostile to a running database:

- **Sync interleaves with WAL checkpointing.** SQLite's durability assumes it owns the
  `.db`, `.db-wal` and `.db-shm` set. A sync daemon copying those three files at
  independent moments can capture a torn, mutually inconsistent state.
- **Eviction pulls a file out from under an open connection.** With Optimize Storage on,
  macOS may replace a file's contents with a `dataless` stub and fetch on demand. A
  database handle does not survive that cleanly.

This is not hypothetical on this machine: 94 files under `~/Documents` are already
`dataless`, including `.py` source files.

**A future session will be tempted to put the data in `~/Documents/Local Documents/Cards/`
because that is where the planning documents live and it looks like the obvious place.
Do not.** That mistake was made once and caught before it shipped.

Check before trusting a path: `xattr <dir>` showing `com.apple.file-provider-domain-id`
means synced. `find <dir> -flags +dataless` finds already-evicted files.

## Backups — iCloud is the destination, never the home

The `holding` rows are irreplaceable. The backup is a `sqlite3 .backup` of a **quiesced**
file, written into `~/Documents/Local Documents/Cards/binder-backups/`.

That gets the offsite copy iCloud is genuinely good for while never letting a live
database sit under the sync daemon. The pattern is Chef's Choice's `backup.py`.

**Not built yet** — there is no schema and no database. Decision recorded so it is not
re-argued, and so nobody "helpfully" points the data directory at iCloud instead.

---

## The tier boundary

**This is the load-bearing invariant of the whole application.**

The schema has four tables in two tiers:

| tier            | tables                  | property                                                         |
| --------------- | ----------------------- | ---------------------------------------------------------------- |
| **Catalogue**   | `card`, `set`, `player` | Refreshable from external sources. Regenerable. Safe to rebuild. |
| **Andy's data** | `holding`               | Irreplaceable. Cannot be re-derived from anything.               |

A `card` is the print — set, year, number, subject, **parallel**, **print run**. The image
belongs to the card, because a Black Refractor and its base card are different prints that
look different. A `holding` is the copy Andy owns — `serial_instance`, `cert_number`,
cost, grade, condition, acquisition date, and a nullable `position`.

> **A catalogue refresh must never touch a holding.**

This is why TypeScript is in the stack. The invariant is type-expressible: `Card` and
`Holding` are distinct types, and a refresh function's signature must make passing it a
`Holding` a compile error. Types are load-bearing here, not decoration.

**Why this is stated so emphatically:** Chef's Choice hit this exact boundary. A change
proven safe by a database dry-run broke **31 tests**, because the coupling was in the
fixtures rather than the column the blast-radius analysis had grepped. Scope changes here
to the *rows* affected, and grep the tests and fixtures, not only application code.

---

## Measured on this machine — do not build these

A spike measured real card scans in real pockets in headful Chrome on this hardware
(M4, 120 Hz display, so the frame budget is 8.33 ms). The numbers:

| measurement                                     | result                                                |
| ----------------------------------------------- | ----------------------------------------------------- |
| Cold 12-pocket spread swap (24 images, 300×420) | **36.7 ms** p50, 56.5 ms p95, **zero** dropped frames |
| Same with explicit preload + off-DOM decode     | **42.1 ms** — ~15% **slower** than doing nothing      |
| 1,008 cards FLIP-animating simultaneously       | **zero** dropped frames, worst frame 9.4 ms           |
| 2,016 pockets built and laid out                | **12.5 ms**                                           |
| 3,000 pockets + images, JS + DOM memory         | **< 1 MB**                                            |
| Pocket derivative file size (300×420, q85)      | 38.5 KB median                                        |

**Therefore, do not build:**

- ❌ a virtualisation layer — a binder shows 24 cards at a time; 2,016 lay out in 12.5 ms
- ❌ an image cache tier — the browser's own cache beat an explicit one
- ❌ a preload scheduler — measured *slower* than doing nothing
- ❌ a hand-rolled FLIP library — plain `getBoundingClientRect` + Web Animations API held
  120 fps with 1,008 cards

If you are about to add any of these, the numbers above say you are solving a problem
this app does not have. Re-measure before overriding.

### Measure against this machine's idle floor, never a nominal frame budget

A 120 Hz display implies an 8.33 ms budget. **Do not compare anything against 8.33 ms.**
Measure what `requestAnimationFrame` does on this machine with nothing animating, in the
same run, and judge the work against *that*.

**Observed 2026-08-19/20**, headful Chromium 151.0.7922.34 via Playwright 1.62, built-in
Liquid Retina XDR at 120 Hz: idle rAF ran **8.30 ms median, 9.30–9.40 ms worst** across many
runs. Roughly 40% of frames already exceeded 8.33 ms while the page sat perfectly still.

> **Those numbers are shown to make the point, not to be compared against.** They are a
> dated observation of one machine on one browser build, and the rule above is *measure the
> floor in the same run*. A future session that diffs its results against 8.30 ms has
> committed the error this section exists to prevent, using this section's own evidence to
> do it. Measure the floor; do not look it up.

This is not hypothetical. A first pass at the page-turn variants reported *127 of 310
frames over budget* and a 9.4 ms worst frame — for **all four** variants, including the
pure cross-fade, which animates one opacity and nothing else. **Four identical results
across four different workloads is a measurement of the environment, not of the work.**
Against the idle floor the same runs show zero dropped frames.

Two corollaries, both learned the same way:

- **Headful Chromium only — the requirement is headful, not a particular browser.**
  Headless Chromium does not composite on a real display clock, so its frame deltas are not
  comparable to anything in the table above, including the 36.7 ms already on record.
- **Detach the instrument before trusting the timing.** A CDP screencast running during a
  turn produced a single 158 ms frame that disappeared the moment the screencast was
  removed. When a measurement needs pixels, capture pixels in one run and time in another;
  never in the same one.

**Use `curl`, not Python's `urllib`, to reach the network from a script here.** This
machine's Python has no CA bundle, so `urllib` fails every HTTPS request with
`CERTIFICATE_VERIFY_FAILED: unable to get local issuer certificate`. `curl` uses the system
trust store and works. Parse with `json.loads(..., strict=False)` — the GitHub Actions API
returns raw control characters that strict parsing rejects.

**Two caveats, so the numbers are not over-read.** The pocket derivative is still worth
generating — for *disk* (230 MB vs 1.2 GB across the collection), not for frame time. And
a single scrolling document of 3,000 cards *did* jank; the binder flips rather than
scrolls, so this does not apply — but a grid view, if one is ever built, would need
virtualising.

---

## Stack, and why

**TypeScript · Svelte 5 + Vite · small Node API server · SQLite (better-sqlite3 + Drizzle)
· Vitest + Playwright · Biome · Node 24.**

- **TypeScript** — for the tier boundary above. That is the reason; not general hygiene.
- **Svelte over React** — FLIP-style reflow is this app's central interaction, and React's
  reconciliation is something you route around to do direct DOM measurement.
  *Counter, acknowledged:* React has better AI-assistance density — asserted, not measured.
- **Svelte over vanilla JS** — **not** on performance; the spike showed vanilla holds
  120 fps with 1,008 cards. Vanilla lost on maintainability: Chef's Choice's
  `static/app.js` reached 3,730 lines.
- **SQLite over Postgres** — single-user and offline, so a daemon buys nothing, and :5432
  is already taken by a running `recipe-postgres`. Decisive: backup is copying one file,
  atomically, while the app runs.
- **Biome over SonarQube** — SonarQube's differentiated value is duplication analysis and
  coverage policy across teams. This is single-user, no auth, no network exposure.
- **Node 24** — Node 20 is past EOL (2026-04-30) and `better-sqlite3@13` requires `>=22`.

**TypeScript is pinned to `~6.0.3`, not 7.** TypeScript 7 (the native compiler) is
released and `tsc --noEmit` passes on it, but `svelte-check@4.7.6` declares
`typescript: "^5.0.0 || ^6.0.0"` and refuses to run against 7 without also installing 6
under an npm alias plus a `--tsgo` flag. TS 7's benefit is compile speed, which is
irrelevant at this size; the reason TypeScript is here is the tier boundary, which 6
expresses identically. Revisit when svelte-check supports 7 directly.

**The server runs straight from `.ts` source** — `node server/index.ts`. Node 24 *strips*
types rather than compiling them, so syntax needing a real transform (`enum`, `namespace`,
parameter properties) fails at runtime. `tsconfig.json` sets `erasableSyntaxOnly` and
`verbatimModuleSyntax` so the compiler rejects that syntax instead of it reaching runtime.

**A custom property containing `var()` is substituted where it is DECLARED, not where it is
used.** This silently half-works, and the half that works disguises the half that does not.

Deriving layout from a scale factor looks like it should work:

```css
:root { --k: 1; --card-w: calc(150px * var(--k)); }
.spread { --k: 2; }              /* intends: everything doubles */
```

It does not. `--card-w` is substituted at computed-value time **on `:root`**, using `:root`'s
`--k`, and inherits downward already frozen at 150px. Meanwhile a real property written as
`font-size: calc(9px * var(--k))` resolves `var(--k)` **on the element itself** and correctly
reads 2. The result was type at double size inside a card that had not grown.

**Why this one is dangerous rather than merely annoying:** the symptom looks like the *design
rule* failing — "proportional scaling doesn't work" — rather than the implementation failing.
It was caught only by measuring the rendered card width against the intended one.

> **Derived geometry must be declared on the same element that sets the scale factor**, not on
> an ancestor. Put the whole derivation in a class and apply that class wherever `--k` is set.

If a scale-dependent value ever looks wrong, measure the rendered box before touching the rule
that produced it.

**Biome cannot see inside a `.svelte` template.** It parses only the `<script>` block, so
`correctness/noUnusedVariables` and `correctness/noUnusedImports` false-flag every variable
and every component import used solely in markup — including the child components a parent
renders, which is most of them. Both are turned off for `**/*.svelte` in `biome.json`.
Do not "fix" the warning by deleting a variable the template uses.

> **That leaves a real hole, and nothing else covers it.** This was **tested, not assumed**:
> an unreferenced import was added to `src/lib/binder/Page.svelte` and confirmed to be
> reported by **neither** Biome nor `svelte-check --threshold warning`. Genuinely unused
> imports in `.svelte` files are currently caught by nobody.
>
> **Accepted deliberately.** A rule that fires on every correctly-used component import is
> not a rule, it is noise — and noise is what kills the rules that do work. Trading a small
> class of dead imports for a linter people still read is the right trade, and Vite
> tree-shakes the bundle cost anyway.
>
> **Revisit condition, not a scheduled task: if Biome gains Svelte template parsing, turn
> both rules back on.** Recording it as a condition is what stops the gap being accepted
> permanently by default.

---

## How this project is built

- **One concern per commit.** A commit message that needs "and" is two commits. When many
  concerns land in one diff, a wrong call in the middle rides along invisibly instead of
  surfacing at its own seam.
- **Gates stop before the commit, not after.** Present the diff and wait. "It stopped
  before committing" is not the same as "it was checkable along the way".
- **Push is a separate act with its own approval.** Commit and hold. Never push without
  being asked, and after an approved push, watch the Actions run and report green or red.
- **Read-only inspection first.** Look at the real state before changing it. Report with
  `file:line`.
- **Flag deviations, never adapt silently.** A deviation is often a correction — but it
  is only useful if it is said out loud.
- **Open what is meant to be looked at.** This project's method is that Andy judges design at
  true scale on his own display — so a preview that has only been *reported as a file path* has
  not been delivered. Build it, then `open` it in the same turn, and re-open it when it changes
  materially rather than leaving a stale tab. The same applies to anything else whose whole
  point is being seen.
- **Nothing personal in this repo, ever.** No database, no card images, no holdings, no
  tokens. `.gitignore` is the second line of defence; the first is not putting it here.

## Reports about this machine are the only ground truth — so check them against it

The planner cannot see this machine, and does not assert anything about it. The tree, the
filesystem, a run's colour — every one of those reaches the planner as something Claude
Code *reported*. **That makes the report the single point of failure in this method.**

Three failure modes were already understood. All three are about a **signal**:

1. a run went red
2. no run appeared
3. nothing arrived at the remote at all

Each is detectable from the outside, eventually. There is a fourth, on a different axis,
and it is not:

4. **the report and the machine disagree — and the report is what gets acted on.**

It has happened once. The closing report of Round 5 stated that the Round 4 design record
was *"written but not committed"*. It had never been written. Nothing was lost, because
nothing existed to lose. The next one might be a report that something *was checked*.

**Why that specific claim, and not the others in the same report.** The instruction was
*"write it and hold it"*, sitting in a list of prohibitions — do not push, do not change
the sheen, do not rebuild the page-edge stack. The report was composed by walking that
list and confirming each item. For a prohibition, compliance **is** inaction, and needs no
evidence to report. The one positive obligation in the list got answered the way its
neighbours did — from the instruction rather than from the disk — and nothing else in the
turn happened to test it.

**The claim was treated as needing no evidence. It was never beyond evidence.** One
`git status` on `docs/` would have contradicted it — the record's home is a tracked file
there — and so would re-reading the report, which asserted a clean tree in its first line
and an uncommitted file in its last. Nothing hid; nobody
looked. That is the whole value of this section — the failure was cheap to detect at the
moment it was made, and became expensive only by surviving a round.

The general shape to watch for: **a positive obligation whose success state is
indistinguishable from having done nothing.** Those are the claims that most need
evidence, and they are exactly the ones that feel like they need none.

Three rules follow.

- **Before reporting a file written, stat it.** A claim about the filesystem is a
  mechanical fact and gets checked mechanically, never from memory of intent. This is the
  rule the planner already operates under, applied to the participant who was exempt.
- **A prompt's verify section checks the *previous* prompt's claimed outputs, not only its
  own preconditions.** Re-deriving current state is not enough; the point is to re-test
  what was last asserted about it. That is what caught this one, and it should be a
  convention rather than an accident of how one prompt happened to be written.
- **Name the location of anything reported as held, then read the report against itself.**
  The location is what makes the claim checkable. *"Written and held"* is unfalsifiable —
  no observation contradicts it. *"Written into `docs/design-decisions.md` and held"* is
  falsified by one line of output, because that file is tracked and writing into it shows
  as `modified`. A report naming no location is not merely vague; it is the specific shape
  that hides this failure.

  With the location named, the contradiction is readable without touching the disk: a clean
  tree and an uncommitted file in `docs/` cannot both be true. Verified rather than
  assumed — an untracked file dropped in `docs/` shows too, as `??`. Use `git status`;
  `git diff --quiet` sees only tracked files and would miss that case.

  The one escape is work held somewhere git cannot see, which is not hypothetical here: the
  preview-opening convention was found in machine-local memory outside version control a
  round earlier. Naming the location closes that too, because it forces the question.

**A constraint on how prompts are written, not only on how they are read.** §7 of the
prompt that produced this was a list of five prohibitions with one positive obligation
buried inside it. A "Do not" section is a compliance checklist where inaction satisfies
every genuine member, so it trains the reader to confirm each item without evidence — and
the single item that needed evidence got audited the way its neighbours deserved.

> **A positive obligation never goes in a prohibition list.** Give it its own section, with
> its own expected artefact named. If it is worth requiring, it is worth being able to check.

**The same rule pointing the other way — cite what the other side can open.** The planner
once cited a decision ID and a section of a planning document as though both were checkable
here. Neither is in this repo. Claude Code found the substance independently under
**The tier boundary** above — *the image belongs to the card*, and *a catalogue refresh
must never touch a holding* — and said the planner's citation could not be verified rather
than nodding along, which is the behaviour this rule exists to protect.

> **A reference the reader cannot open is decoration wearing the costume of evidence.** It
> invites agreement instead of checking, which is the exact failure a diagnostic is for. Cite
> `file:line` in this repo, or restate the substance inline.

**A verify section must not predict state the prompt itself changes.** A prompt named an exact
`HEAD` as the precondition for its push section, while an earlier section of the same prompt
added another commit. The gate then failed on the author's arithmetic rather than on anything
about the machine.

> **Express it relationally.** *"`HEAD` is the last commit you made in this prompt;
> `origin/main` is `<known hash>`; every commit between them is one you can account for."*
> That is checkable without the author predicting a hash they cannot know, and the
> accountability clause is the part that actually protects anything.

> **The gate's value is that it is not interpreted.** A mismatch small enough to explain away
> is exactly where the habit of explaining starts, and the habit is what kills the gate — not
> any single wrong call. **Stopping on an obvious arithmetic slip is the gate working, not the
> gate being pedantic, and the cost of that stop belongs to whoever wrote the bad verify.**

**That rule has now been broken three times, each time by whoever had most recently written
it down — so the fix is notation, not diligence.** Two forms, both mechanical.

> **A citation to another repository must be visibly not-local.** Prefix it with the project:
> `chefs-choice:README.md:12-22`. The form carries the warning, so no prose has to supply it.
>
> **A cross-repo citation written in local form is the worst kind.** Three were: an `app.py`
> line range, a `README.md` line range and a `CLAUDE.md` line range, each pointing at another
> project entirely. The first failed loudly here and was self-correcting; the other two
> resolved in *this* repo to real, plausible, wrong content and gave the reader no signal at
> all. **A citation that fails is safer than one that misleads.**
>
> **Describe a bad citation form; never reproduce one.** The sentence above used to write those
> three out verbatim as its examples, which made this file an instance of the thing it was
> warning about — two of them resolved against this repository's own files. The decision log
> carried the same passage and the same defect until it migrated. **A specimen and a pointer
> are written identically, so the only safe specimen is a described one.**

> **If a file cannot be frozen, do not cite it by line.** This file cited itself at `95-99`
> and drifted to `93-94`, because the file grew above the target. A record that cites a file
> by line freezes that file — and `CLAUDE.md` is edited every round, so it can never be
> frozen. **Cite living documents by heading; reserve `file:line` for things nothing is
> allowed to rewrite.**
>
> `preview/*.html` is the case that qualifies: committed as evidence, excluded from the
> formatter, and correctable only where the correction cannot change what renders. Source
> files do not qualify — they are cited by symbol or by heading, never by line.

**A citation is not the only thing that rots. A reversed decision does too.**

> **When a decision is reversed, sweep every document that recorded it.** A dropped decision
> leaves residue wherever it was ever written down, and each copy is a live source for whoever
> reads that document next. **Twelve-pocket was dropped and then found alive three times:** in
> a superseded stage plan, in a prompt that quoted that plan as "24 slots", and in this
> repository's public `README.md`, which told visitors that pages hold 4, 9 or 12 for as long
> as it stood. Nobody swept. **Removal is part of reversing a decision, not a follow-up to
> it** — the residue outlives the decision otherwise.

### Who holds the record — and it is not the side that carries the thread

The arrangement assumes the executor starts fresh each session while the planner carries
continuity. **For anything ever actually said or sent, that is backwards.** Claude Code holds
the transcript; the planner holds a summary.

> **On any question of what was in a previous prompt, Claude Code is the source of truth and
> the planner is not.** The planner's memory is lossy in a way it cannot detect from the
> inside — a summary reads as complete, and nothing in it announces what was dropped. So the
> planner does not assert that something was, or was not, said. It asks for the transcript.

This is the citation rule turned on the participant who wrote it: **a claim about the record
has to rest on the record, and only one side of this arrangement is holding it.**

**The incident.** A planner escalated a possible fabricated attribution — a design record
crediting Andy with a decision, with no visible source. The source was a prompt the planner
had written itself and then lost: two of its own prompt headers had created a gap in the
numbering, and the retained summary gave no sign anything was missing. The escalation was
built on *"I don't remember writing it"* presented as *"it was not written."*

**That gap is where this failed, and it is the general form.** "I have no record of it" and
"it did not happen" are different claims, and only the first one is ever available to a
participant working from a summary. The check that resolves it costs one request for the
transcript.

**But note what that check is: asking the party under suspicion to produce the evidence.**
It worked here because the quote was verifiable against the planner's own writing and against
the surrounding facts, so it could be checked without trusting the party that produced it.
That will not always be true, and "ask the accused for the record" is a weak check in general.

> **The independent check is Andy.** He holds the session too, and can read the transcript
> directly without either of us mediating it. That is the escalation path when a report and a
> suspicion cannot be reconciled between the two of us — written down now rather than
> improvised at the moment it is needed, because the moment it is needed is the moment
> nobody's account can be taken on trust.

### A dramatic first result is more likely to be a broken instrument than a broken thing

This has now happened three times, and twice the tell was identical.

| the first result | what it actually was |
| ---------------- | -------------------- |
| *127 of 310 frames over budget*, for all four turn variants | a nominal 8.33 ms compared against, instead of this machine's idle floor |
| a single **158 ms** frame during a page turn | the CDP screencast that was measuring it |
| **70% of pixels differ**, max delta 234, on the Svelte port | element screenshots taken at two different subpixel offsets |

**The tell, twice, was a result too uniform to be real.** Four different workloads do not
produce four identical numbers. A port that then measures geometrically exact — same
1096 px frame, same 2 px gutter, same z-scale — does not differ in 70% of its pixels.

> **Before reporting an extreme measurement, reproduce it with the apparatus changed.**
> A different capture method. A control that should show nothing and must therefore show
> nothing. The instrument detached entirely. If the number survives all three it is real;
> if it moves, the apparatus was the finding.

**A control is only a control if it varies the thing you suspect.** One of the controls used
here — the same page diffed against itself with the frame pushed 137 px down the document —
returned an exact zero and proved nothing, because `scrollIntoView` had put both captures at
the same viewport position before the screenshot. It looked like evidence and was inert.
Check that a control can actually fail before trusting that it did not.

### Before trusting a table, add it up

**The internal-consistency check is not only for reports.** A record whose own numbers do not
agree is falsifiable without leaving the document — no file to open, no measurement to take,
no second opinion to get.

Round 4's frame table stated a **16 px** spine two rows from a **40 px** frame cost that is
only arithmetic at 18: 11 px of board on each side plus an 18 px spine is 40, where 16 gives
38. The table contained its own refutation and sat wrong for two rounds, in a document that
was public and pushed. It cost one subtraction to catch and nobody did the subtraction.

> **Numbers that derive from each other are a checksum. Compute it.** This is the same rule
> that catches a report claiming a clean tree and an uncommitted file, applied to a record
> instead of a message.

### Correct a wrong measurement; keep a wrong argument

**The two failures are not the same kind of thing, and the record should not treat them the
same way.**

- **A wrong argument teaches by being kept.** The reasoning is the artifact worth preserving,
  and striking it hides why the record moved. This file already keeps several — the scrim
  ruled out before it was built, the lit-sleeve prediction, the bottom edge the grid was
  supposed to supply. Each is marked corrected and each still earns its place.
- **A wrong measurement teaches nothing.** Nobody learns from a number that was never true,
  and anyone reading it as a value is misled. Replace it.

> **Replace the number; keep the shape of how it went wrong.** In the Round 4 case the shape
> was *reading a value from a `:root` base rather than from the variant that was judged* —
> and that shape recurred three times in one table. The shape is the reusable part; the wrong
> figure is not.

### Three rules for tests that defend a record

**A ratio test defends a relationship; an absolute test defends a decision.** 4-pocket being
exactly 2× the 9-pocket is a *relationship*, and asserting the ratio survives a deliberate
change to a base value. The card at **150 × 210** is not derived from that rule — it is the
decision that cards read at true binder scale rather than as a gallery of giant cards, and a
ratio test passes happily on a binder of 75 × 105 cards.

> **Ask what the record actually settled before choosing which to assert.** Twelve scaled
> properties, eleven ratio assertions, one absolute — because eleven are consequences and one
> is a decision.

**A test you have not seen fail is not a test.** Break the thing each test defends, confirm
it goes red, revert. And confirm it fails **only its own** test:

> Three tests where one break reddens two are **two tests and a duplicate**. Three where a
> break reddens none are **three pieces of decoration**.

This is the control rule — *a control is only a control if it can fail* — turned on the tests
themselves. `tests/e2e/geometry.spec.ts` was verified this way: a constant sleeve inset
reddens the scaling test alone, `nowrap` plus `ellipsis` reddens the wrap test alone, and
`isolation: isolate` on a pocket reddens the z-scale test alone.

**Check that the test environment contains the thing being tested.** The two invariants above
are facts about *computed* style. Vitest's node environment performs no layout and jsdom
resolves no `calc()`, so both tests would have passed on unresolved strings — green, in an
environment where the failure they exist to catch cannot occur.

> **A green test in an environment that cannot represent the failure is worse than no test**,
> because it reports coverage that does not exist. Before writing the assertion, ask whether
> the runner can even produce the bug.

### Two things that look dead and are not

A dead-code sweep will find both of these again. Neither is dead.

- **`/api/health` has no caller in the UI**, and that is not evidence of anything. It is read
  by `server/index.ts` at startup to print the resolved data directory, and it is the
  readiness probe Playwright waits on before running the e2e suite — see the `webServer`
  block in `playwright.config.ts`. Removing it stops the test run from ever starting.
- **A custom property read through `getComputedStyle` is invisible to grep.** `--dur` appears
  in `app.css` and in no `var()` anywhere, which looks conclusive and is wrong: the page-turn
  duration is read at runtime in `Spread.svelte`, inside `duration()`. **Grep is not a
  dead-code detector for CSS custom properties** — a token can be read by a string lookup that
  no static search will match.

### Two implicit dependencies, both silent until something moves

Recorded together because they are the same failure at two scales: **something worked because
of a condition nobody had written down, and nothing announced the condition until it broke.**

**A tool that only runs from where it was written has an undeclared dependency.** The parity
harness read its captures from an http server that had been started by hand in the session
that wrote it. Moving it to `tests/visual/` surfaced that immediately — over `file://` a
canvas taints cross-origin and the whole comparison fails. Until then the gate had been
reporting *exact* results under conditions nobody had recorded, which is the same shape as
work "held" somewhere unnamed, and as the preview-opening convention found living in
machine-local memory.

> **Moving a tool is a cheap test for whether it stands on its own. A gate that only works in
> one place is not yet a gate.**

**A record that cites a file by line freezes that file.** `docs/design-decisions.md` cites
`preview/*.html` by line as the evidence for settled decisions. That makes every tool with
write access — formatter, codemod, auto-fixer, a well-meaning hand edit — a threat to the
citation, and **the failure is silent: the line still exists, it just says something else
now.** Biome is excluded from `preview/` for exactly this reason, and the exclusion protects
the citations rather than the code style.

> **Before pointing a `file:line` at anything, ask what is allowed to rewrite it.** If the
> answer is "a formatter", the citation is already stale and nobody will be told.

Claude Code's part in the same incident is recorded above: the citation that triggered it
named the wrong prompt — the right instruction, the wrong section — one commit after the
rule requiring verifiable citations went into this file. Both failures are real and neither
excuses the other.

## The decision log lives here — `docs/project-log.md`

**Andy's decision: the decision log is public.** It migrated into this repository at Stage C
and ships with it.

**Why, and it is not sentiment.** This repository is a portfolio piece, and the log is the
strongest artifact in it. Working code is table stakes and every candidate has some. A record
of decisions with the alternatives that lost, positions overturned by measurement, and errors
caught before they cost anything is the thing that is hard to fake and rare to find.

**Nothing about this changes what stays out.** No database, no card images, no holdings, no
tokens. That rule is unrelated to this one and is not relaxed by it. What ships is reasoning,
not data. **Andy's method document stays out and will not enter this repository.**

### Which of the three documents a thing belongs in

There are now three records here and they overlap. The boundary, so a future session does not
have to re-derive it:

- **`docs/design-decisions.md`** — *how* a design decision was reached. The arguments, the
  alternatives, the measurements, and the limit of each justification.
- **`docs/project-log.md`** — *what* a decision commits the project to, and the incidents that
  taught the method. Consequences that bind future stages; errors, kept deliberately.
- **`CLAUDE.md`** — what a future session must *do*. Imperative and current, carrying only as
  much history as makes a rule stick.

Two rules that decide most cases:

> **The rule lives here; the incident lives in the log.** Prose may recur across the three — a
> rule that stung is allowed to be stated twice. **A measurement that can be taken again may
> not**, because two copies of a live number is how they come to disagree. The idle floor is
> dated here and pointed at from the log for exactly that reason.

> **A number defended by a test does not belong in the log.** The twelve scaling ratios, the
> card at 150 × 210, the z-scale — a test asserts each and reddens if it moves. The log holds
> the constraints no test can express: *must not be retrofitted*, *belongs on `card` not
> `holding`*, *written in the same transaction*.

### It stays current by the mechanism that already exists

Do not invent a process for this. The machinery is the one that caught the Round 4 record:

- **a decision's prompt names the log update as one of its outputs**, in its own right, never
  buried in a list of prohibitions
- **the next prompt's verify section checks that output**, the same way it checks any other
  claimed artefact

That is the whole mechanism, and it works because it makes the update a checkable claim rather
than an intention. **"Keep it updated" as an intention is exactly what left Chef's Choice's
README broken for six weeks** on a project run with more discipline than most — see the
cold-start section below, which exists because of it. An intention that nobody verifies decays
at a rate nobody notices.

### One authoritative copy, owned here

**Claude Code owns `docs/project-log.md` and it is the only live copy.** Any copy held
elsewhere is a pointer to this one.

This is the same transition already made for `docs/design-decisions.md`, and for the same
reason: **two live copies of a decision record is how they diverge**, and the divergence is
silent until someone acts on the stale one. A pointer cannot go stale.

### Three read-throughs, done at migration — and what a later addition owes

Each was a pass with one question, and each still applies to anything added later.

1. **What made sense in a private planning document and does not in a public repo.**
   Machine-specific paths, filesystem detail, anything describing Andy's setup rather than the
   project's decisions. A count of what he owns is inventory and does not go in; a card named
   as the thing a design was judged against is provenance and does.
2. **Every reference to material held outside this repository must be made self-contained.**
   Restate the principle inline; do not point at a source no reader can open. A public document
   referencing a private one reads as a broken dependency **and leaks the shape of the thing
   being kept private** — which is why naming the private file is itself the leak. Where a claim
   genuinely cannot stand alone, say so rather than weakening it to something that can.
3. **Anything personal that is not a decision.** The same rule as the rest of the repo, applied
   once more at the moment of publication, because that is the last point at which it is cheap.

> **What none of the three passes may do is remove something for being unflattering.** The log's
> errors are the reason it is worth publishing. That instruction is written at the top of the
> document itself so a later session does not have to infer it.

## The cold start belongs to CI

Whatever `README.md` tells a stranger to run is what CI runs, from a clean checkout.

**Why this is mechanised rather than performed by a human:**
`chefs-choice:README.md:12-22` documents a cold start that cannot work — it omits
`npm install && npm run build`, while `chefs-choice:app.py:449-454` reads
`dist/index.html` directly, so `/` returns 500. `chefs-choice:CLAUDE.md:41-48` has the
correct sequence and even annotates the gap. The README was never fixed and stayed broken
for six weeks, on a project run with more discipline than most. A human-performed install
ritual is exactly the check that already failed.

On a public portfolio repository this is the difference between "I cloned it and it
worked" and "I cloned it and gave up".
