<script lang="ts">
/* The binder. Every locked decision from Rounds 1-5, in the real stack.

   This is a port of preview/locked.html, not a redesign — the preview is what was
   judged and this has to reproduce it. Cards are hardcoded fixtures; there is no
   schema yet and nothing here reads the API. */

import { buildSpreads, FOUR_POCKET_OPENER } from "./lib/binder/cards.ts";
import Spread from "./lib/binder/Spread.svelte";

const nine = buildSpreads(9, 6);
const four = buildSpreads(4, 6, FOUR_POCKET_OPENER);
</script>

<main>
  <h1>Sports Card Binder</h1>

  <section data-testid="binder-nine">
    <h2>9-pocket — browsing</h2>
    <Spread spreads={nine} k={1} cols={3} label="9-pocket" />
  </section>

  <section data-testid="binder-four">
    <h2>4-pocket — display</h2>
    <Spread spreads={four} k={2} cols={2} label="4-pocket" />
  </section>
</main>

<style>
  main {
    max-width: 1560px;
    margin: 0 auto;
    padding: 34px 26px 120px;
  }
  h1 {
    font: 600 20px/1.2 var(--cond);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin: 0 0 6px;
  }
  h2 {
    font: 600 14px/1.2 var(--cond);
    letter-spacing: 0.13em;
    text-transform: uppercase;
    margin: 54px 0 6px;
  }
</style>
