<script lang="ts">
/* One pocket: a hole welded into a sheet of plastic.
   Rounds 1-3, and the z-order is load-bearing — see the z-scale in
   docs/design-decisions.md. Do NOT give this element its own stacking context:
   isolating it lifts the page's specular above everything inside, including the
   reveal, and re-breaks "UI sits above the plastic". */
import type { Slot } from "./types.ts";

let { card }: { card: Slot } = $props();

/* Held open on tap, for touch. Hover handles the pointer case in CSS. */
let held = $state(false);
</script>

{#if card}
  <div
    class="pk filled"
    class:held
    onclick={() => (held = !held)}
    onkeydown={(e) => e.key === "Enter" && (held = !held)}
    role="button"
    tabindex="-1"
  >
    <div class="well"></div>
    <div class="card"><img src="img/{card.f}" alt="" loading="eager" /></div>
    <div class="mouth"></div>
    <div class="rv">
      <div class="n">{card.n}</div>
      <div class="l">{card.year} · {card.set}</div>
      {#if card.parallel}<div class="l">{card.parallel}</div>{/if}
      {#if card.serial}<div class="l s">{card.serial}</div>{/if}
    </div>
    <div class="lip"></div>
  </div>
{:else}
  <div class="pk empty">
    <div class="well"></div>
    <div class="mouth"></div>
  </div>
{/if}

<style>
  .pk {
    position: relative;
    width: calc(var(--card-w) + 2 * var(--inset));
    height: calc(var(--card-h) + 2 * var(--inset));
    border-radius: calc(3px * var(--k));
  }
  /* occupied: the well IS the page colour. Nothing between card and page. */
  .well {
    position: absolute;
    inset: 0;
    border-radius: calc(3px * var(--k));
    background: var(--page);
    z-index: 1;
  }
  /* empty: the lit sleeve, dimmed to ~40% of Round 2's lift */
  .pk.empty .well {
    background: var(--well);
    background-image: linear-gradient(
      138deg,
      rgba(255, 255, 255, var(--well-hi)) 0%,
      rgba(255, 255, 255, calc(var(--well-hi) * 0.12)) 46%,
      rgba(0, 0, 0, 0.16) 100%
    );
    box-shadow:
      inset calc(1px * var(--k)) calc(1px * var(--k)) 0 rgba(255, 255, 255, var(--well-rim)),
      inset calc(-1px * var(--k)) calc(-1px * var(--k)) 0 rgba(0, 0, 0, 0.42);
  }
  /* where the two films separate */
  .mouth {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: calc(4px * var(--k));
    border-radius: calc(3px * var(--k)) calc(3px * var(--k)) 0 0;
    pointer-events: none;
    z-index: 2;
    box-shadow:
      inset 0 calc(1px * var(--k)) 0 rgba(255, 255, 255, 0.13),
      inset 0 calc(-1px * var(--k)) 0 rgba(0, 0, 0, 0.45);
  }
  .card {
    position: absolute;
    left: var(--inset);
    top: var(--inset);
    z-index: 2;
    width: var(--card-w);
    height: var(--card-h);
    border-radius: var(--radius);
    box-shadow: calc(1px * var(--k)) calc(2px * var(--k)) calc(4px * var(--k)) rgba(0, 0, 0, 0.55);
  }
  .card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    border-radius: var(--radius);
  }
  /* Round 1, on hover; held open on tap. z 4: above the sheet's specular, or a
     highlight washes across the text — and below the card's own lip. */
  .rv {
    position: absolute;
    left: var(--inset);
    right: var(--inset);
    bottom: var(--inset);
    z-index: 4;
    padding: calc(6px * var(--k)) calc(8px * var(--k)) calc(7px * var(--k));
    background: var(--scrim); /* 90% — the show-through is deliberate */
    border-top: calc(1px * var(--k)) solid var(--scrim-edge); /* flat panel, hard edge */
    border-radius: 0 0 var(--radius) var(--radius);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.11s ease-out;
  }
  .pk.filled:hover .rv,
  .pk.held .rv {
    opacity: 1;
  }
  .rv .n {
    font: 600 calc(9px * var(--k)) / 1.25 var(--cond);
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--ink);
  }
  .rv .l {
    font: 500 calc(7.5px * var(--k)) / 1.45 var(--cond);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-dim);
    font-variant-numeric: tabular-nums;
  }
  .rv .s {
    color: var(--ledger);
  }
  /* the card's own lit edge — directional, bright top-left, dark bottom-right.
     Above the reveal: a label never truncates the object it labels. */
  .lip {
    position: absolute;
    left: var(--inset);
    top: var(--inset);
    z-index: 5;
    width: var(--card-w);
    height: var(--card-h);
    border-radius: var(--radius);
    pointer-events: none;
    box-shadow:
      inset calc(1px * var(--k)) calc(1px * var(--k)) 0 rgba(255, 255, 255, 0.26),
      inset calc(-1px * var(--k)) calc(-1px * var(--k)) 0 rgba(0, 0, 0, 0.5);
  }
</style>
