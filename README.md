# Sports Card Binder

[![CI](https://github.com/abh5227/Sports-Card-Binder/actions/workflows/ci.yml/badge.svg)](https://github.com/abh5227/Sports-Card-Binder/actions/workflows/ci.yml)

A personal sports-card collection app, built around a single idea: **the interface should
be a binder, not a spreadsheet.**

Card images sit in pockets on a two-page spread you flip through. Pages hold 4, 9 or 12
cards. Cards render at true binder scale — roughly 150 × 210 CSS px, the size a real card
is when you are looking at a page of them. Clicking a card lifts it out of its pocket for
a closer look, and turns it over.

Four sports: baseball, basketball, football, hockey. Single user, local, offline-capable,
built to grow to a few thousand cards.

> **Status: Stage B — scaffold.** The toolchain and a machine-verified cold start.
> There is no schema, no binder UI and no card entry yet. Each stage answers one question
> and produces one thing to look at; this one answers *"does the toolchain run end to
> end on a clean checkout?"*

## Setup

Requires **Node 24 or newer** (`better-sqlite3` needs ≥22; Node 20 is past end of life).

```bash
npm install
npm run build     # Vite builds the frontend into dist/, which the server serves
npm start         # http://127.0.0.1:8787
```

That is the whole cold start. **CI runs exactly these commands from a clean checkout on
every push** — if they stop working, the build goes red.

That is deliberate. A cold start only a human verifies is one that quietly rots; this
project has a documented case of exactly that going unnoticed for six weeks.

### Developing

Two processes, so the frontend gets hot reload:

```bash
npm run dev:server   # API on :8787, restarts on change
npm run dev          # frontend on :5173 with HMR, proxies /api to :8787
```

### Checks

```bash
npm run typecheck             # tsc + svelte-check
npm run lint                  # Biome
npm test                      # Vitest — unit
npx playwright install chromium
npm run test:e2e              # Playwright — builds, serves, drives a real browser
```

The server runs straight from TypeScript source; Node 24 strips the types, so there is no
separate build step for it. `tsconfig.json` sets `erasableSyntaxOnly` so the compiler
rejects any syntax that would need a real transform, rather than leaving that as a rule to
remember.

## Your data lives outside this repository

This repo is public. The collection is not.

The database, cached card images and any exports live in a data directory **outside the
repo**, set by environment variable:

| variable          | default                    |
| ----------------- | -------------------------- |
| `BINDER_DATA_DIR` | `~/Developer/binder-data/` |

```bash
export BINDER_DATA_DIR="/path/you/prefer"
```

The default is a default, not a lock-in — the app never assumes its data sits inside its
own folder. Nothing personal is ever committed here: no database, no card images, no
holdings, no tokens.

One caveat specific to macOS: **do not point `BINDER_DATA_DIR` at an iCloud-synced folder**
such as `~/Documents` or `~/Desktop`. Sync interleaving with SQLite's WAL checkpointing,
and file eviction under Optimize Mac Storage, are both capable of corrupting a live
database. Backups belong in iCloud; the working database does not. See
[CLAUDE.md](CLAUDE.md) for the detail.

## Stack

**TypeScript · Svelte 5 + Vite · Node API server · SQLite (better-sqlite3 + Drizzle) ·
Vitest + Playwright · Biome · Node 24**

Two choices worth explaining, because both went against the obvious answer:

- **TypeScript is here for one specific invariant.** The schema splits into *catalogue*
  data (`card`, `set`, `player` — refreshable, regenerable) and *holdings* (the copies
  actually owned — irreplaceable). A catalogue refresh must never touch a holding, and
  that is a constraint the type system can enforce at compile time rather than a rule
  people remember.
- **No virtualisation, no image cache, no preload scheduler, no FLIP library.** Not an
  oversight — measured. A cold 12-pocket spread swap costs 36.7 ms with zero dropped
  frames at 120 Hz; explicit preloading measured ~15% *slower* than the browser's own
  cache; 1,008 cards FLIP-animating simultaneously dropped no frames at all. The
  architecture those layers would have justified was deleted by the measurement.

Full reasoning, and the numbers, in [CLAUDE.md](CLAUDE.md).

## Not built yet

Schema and migrations · the binder UI · card entry · image sourcing and normalisation ·
sorting and navigation · set-completion mode · price and value tracking.

Physical storage — slabs, one-touch holders, "which shelf is it on" — is out of scope
permanently. Every card renders identically in a pocket. So are trading-card games; this
is four sports.

## Licence

[MIT](LICENSE) © 2026 Andrew Hannah
