<script lang="ts">
/* Frame B and the page turn.
   Frame B — Round 4: pages, a thin surrounding board, a recessed spine, no rings.
   T3 at 420 ms — Round 5: one leaf, double-sided, cards riding in their pockets
   through the arc. The leaf's reverse IS the next spread's left page, so the turn
   assembles the next spread rather than preceding it.

   The frame does NOT scale with --k. B won partly on costing 40 px; doubling that
   at 4-pocket would un-decide it. Recorded as a gap in preview/locked.html. */
import Page from "./Page.svelte";
import type { Spread } from "./types.ts";

let {
	spreads,
	k = 1,
	cols = 3,
	label = "",
}: { spreads: Spread[]; k?: number; cols?: number; label?: string } = $props();

const EASE = "cubic-bezier(.34,.03,.25,1)";

let idx = $state(0);
let stage: HTMLDivElement;
let rslot: HTMLDivElement;
let leaf: HTMLDivElement;
let turning = $state(false);

/** An empty binder has no spread to show, so the callers guarantee at least one.
 *  `noUncheckedIndexedAccess` makes that guarantee explicit rather than assumed. */
const EMPTY: Spread = { l: [], r: [] };
const cur = $derived(spreads[idx] ?? EMPTY);
const nxt = $derived(spreads[idx + 1] ?? spreads[idx] ?? EMPTY);

/** The leaf sits exactly on the right slot, so it has to be measured rather than
 *  described: the slot's width follows from --k and the card geometry. */
let box = $state({ left: 0, width: 0, height: 0 });
function measure() {
	if (!stage || !rslot) return;
	const b = rslot.getBoundingClientRect();
	const s = stage.getBoundingClientRect();
	box = { left: b.left - s.left, width: b.width, height: b.height };
}
$effect(() => {
	// re-measure whenever the layout that determines the slot changes
	void k;
	void cols;
	void idx;
	measure();
});

function duration(): number {
	const v = getComputedStyle(document.documentElement).getPropertyValue("--dur");
	return Number.parseFloat(v) || 420;
}

function bounce() {
	stage
		?.querySelector(".spread")
		?.animate(
			[
				{ transform: "translateX(0)" },
				{ transform: "translateX(9px)" },
				{ transform: "translateX(0)" },
			],
			{ duration: 200, easing: "ease-out" },
		);
}

function turn(dir: 1 | -1) {
	if (turning) return;
	if (dir < 0 && idx === 0) return bounce();
	if (dir > 0 && idx >= spreads.length - 1) return bounce();
	turning = true;
	const dur = duration();
	const from = dir > 0 ? 0 : -180;
	const to = dir > 0 ? -180 : 0;
	leaf.animate([{ transform: `rotateY(${from}deg)` }, { transform: `rotateY(${to}deg)` }], {
		duration: dur,
		easing: EASE,
		fill: "forwards",
	});
	// the leaf swings away from the light and back: its faces change luminance
	// through the arc rather than carrying a painted highlight
	for (const [i, sh] of [...leaf.querySelectorAll(".shade")].entries()) {
		const a = dir > 0 ? [0, 0.42, 0.55] : [0.55, 0.42, 0];
		sh.animate(
			i === 0
				? [{ opacity: a[0] }, { opacity: a[1], offset: 0.5 }, { opacity: a[2] }]
				: [{ opacity: a[2] }, { opacity: a[1], offset: 0.5 }, { opacity: a[0] }],
			{ duration: dur, easing: "ease-in-out", fill: "forwards" },
		);
	}
	for (const band of leaf.querySelectorAll(".sheet-sheen i")) {
		band.animate(
			[
				{ transform: `translateX(${dir > 0 ? 0 : -38}%)` },
				{ transform: `translateX(${dir > 0 ? -38 : 0}%)` },
			],
			{ duration: dur, easing: "ease-in-out", fill: "forwards" },
		);
	}
	setTimeout(() => {
		idx = Math.max(0, Math.min(spreads.length - 1, idx + dir));
		turning = false;
		// the leaf is reused for the next turn, so it goes back to flat
		for (const a of leaf.getAnimations()) a.cancel();
		for (const el of leaf.querySelectorAll(".shade, .sheet-sheen i")) {
			for (const a of el.getAnimations()) a.cancel();
		}
	}, dur + 30);
}
</script>

<div class="ctl">
  <button onclick={() => turn(-1)}>&larr; Back</button>
  <button onclick={() => turn(1)}>Next &rarr;</button>
  <span class="where">{label} spread <b>{idx + 1}</b> of {spreads.length}</span>
</div>

<div class="scale" style="--k:{k};--cols:{cols}">
  <div class="frame">
    <div class="board"></div>
    <div class="stage" bind:this={stage}>
      <div class="spread">
        <div class="slot"><Page cards={cur.l} side="l" /></div>
        <div class="spine"></div>
        <div class="slot" bind:this={rslot}><Page cards={nxt.r} side="r" /></div>
      </div>
      <div
        class="leaf"
        bind:this={leaf}
        style="left:{box.left}px;width:{box.width}px;height:{box.height}px"
      >
        <div class="face fr" style="width:{box.width}px;height:{box.height}px">
          <Page cards={cur.r} side="r" />
          <div class="shade"></div>
        </div>
        <div class="face bk" style="width:{box.width}px;height:{box.height}px">
          <Page cards={nxt.l} side="l" />
          <div class="shade" style="opacity:.55"></div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  /* Round 3: 4-pocket is 9-pocket at 2x. The derived geometry is declared on the
     SAME element that sets --k — a custom property containing var() is substituted
     where it is DECLARED, so putting these higher up freezes them at k=1. */
  .scale {
    --card-w: calc(150px * var(--k));
    --card-h: calc(210px * var(--k));
    --inset: calc(7px * var(--k));
    --radius: calc(2px * var(--k));
    --gut: calc(2px * var(--k));
    --m-out: calc(12px * var(--k));
    --m-in: calc(20px * var(--k));
    --m-tb: calc(14px * var(--k));
  }
  .frame {
    position: relative;
    display: inline-block;
    padding: 11px;
  }
  .board {
    position: absolute;
    inset: 0;
    border-radius: 3px;
    background: #20242a;
    box-shadow:
      0 1px 2px rgba(0, 0, 0, 0.55),
      0 10px 24px rgba(0, 0, 0, 0.45),
      inset 0 1px 0 rgba(255, 255, 255, 0.055);
  }
  .stage {
    position: relative;
    perspective: 1900px;
    perspective-origin: 50% 45%;
  }
  .spread {
    display: flex;
    align-items: stretch;
    position: relative;
    width: max-content;
  }
  .spine {
    width: 18px;
    flex: none;
    position: relative;
    background: linear-gradient(
      to right,
      rgba(0, 0, 0, 0.55),
      rgba(0, 0, 0, 0.3) 50%,
      rgba(0, 0, 0, 0.55)
    );
    box-shadow:
      inset 1px 0 0 rgba(0, 0, 0, 0.5),
      inset -1px 0 0 rgba(0, 0, 0, 0.5);
  }
  .leaf {
    position: absolute;
    top: 0;
    transform-origin: left center;
    transform-style: preserve-3d;
    will-change: transform;
    z-index: 9;
  }
  .leaf .face {
    position: absolute;
    top: 0;
    left: 0;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }
  .leaf .face.bk {
    transform: rotateY(180deg);
  }
  .leaf .shade {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: #05060a;
    opacity: 0;
    will-change: opacity;
  }
  .ctl {
    display: flex;
    gap: 8px;
    align-items: center;
    margin: 0 0 14px;
    flex-wrap: wrap;
  }
  .where {
    font-size: 11.5px;
    color: var(--ink-dim);
    font-variant-numeric: tabular-nums;
    margin-left: 6px;
  }
</style>
