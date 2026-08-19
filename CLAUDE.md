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
`correctness/noUnusedVariables` false-flags every variable used solely in markup. It is
turned off for `**/*.svelte` in `biome.json`; `svelte-check` covers those files instead.
Do not "fix" the warning by deleting a variable the template uses.

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
- **Nothing personal in this repo, ever.** No database, no card images, no holdings, no
  tokens. `.gitignore` is the second line of defence; the first is not putting it here.

## The cold start belongs to CI

Whatever `README.md` tells a stranger to run is what CI runs, from a clean checkout.

**Why this is mechanised rather than performed by a human:** Chef's Choice's
`README.md:12-22` documents a cold start that cannot work — it omits `npm install &&
npm run build`, while `app.py:449-454` reads `dist/index.html` directly, so `/` returns
500. `CLAUDE.md:41-48` has the correct sequence and even annotates the gap. The README
was never fixed and stayed broken for six weeks, on a project run with more discipline
than most. A human-performed install ritual is exactly the check that already failed.

On a public portfolio repository this is the difference between "I cloned it and it
worked" and "I cloned it and gave up".
