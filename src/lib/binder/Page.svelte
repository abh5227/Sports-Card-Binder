<script lang="ts">
/* One sheet of a spread: a grid of pockets, plus ONE specular for the whole
   sheet. The specular is not the pocket's appearance — it is the sheet's. A
   pocket is a hole welded into a sheet of plastic, and the component boundary
   follows the object.

   Model 2: the band is per-sheet, so a turning sheet owns its own band. */
import Pocket from "./Pocket.svelte";
import type { Slot } from "./types.ts";

let { cards, side }: { cards: Slot[]; side: "l" | "r" } = $props();
</script>

<div class="page" class:lft={side === "l"}>
  <div class="grid">
    {#each cards as card, i (i)}
      <Pocket {card} />
    {/each}
  </div>
  <div class="sheet-sheen"><i></i></div>
</div>

<style>
  /* Mirrored margins: inner larger than outer, because the two inner margins
     face each other across the spine and read as one space. */
  .page {
    position: relative;
    background: var(--page);
    padding: var(--m-tb) var(--m-out) var(--m-tb) var(--m-in);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
  }
  .page.lft {
    padding: var(--m-tb) var(--m-in) var(--m-tb) var(--m-out);
  }
  .grid {
    display: grid;
    gap: var(--gut);
    grid-template-columns: repeat(var(--cols), calc(var(--card-w) + 2 * var(--inset)));
  }
  .sheet-sheen {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 3;
    overflow: hidden;
  }
  .sheet-sheen i {
    position: absolute;
    top: -30%;
    bottom: -30%;
    left: 0;
    right: 0;
    display: block;
  }
  .page.lft .sheet-sheen i {
    background: linear-gradient(
      122deg,
      rgba(255, 255, 255, 0) 30%,
      rgba(255, 255, 255, 0.07) 44%,
      rgba(255, 255, 255, 0.02) 53%,
      rgba(255, 255, 255, 0) 64%
    );
  }
  .page:not(.lft) .sheet-sheen i {
    background: linear-gradient(
      122deg,
      rgba(255, 255, 255, 0) 4%,
      rgba(255, 255, 255, 0.041) 17%,
      rgba(255, 255, 255, 0.012) 25%,
      rgba(255, 255, 255, 0) 36%
    );
  }
</style>
