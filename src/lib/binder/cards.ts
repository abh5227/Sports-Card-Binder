import type { Card, Slot, Spread } from "./types.ts";

const c = (
	f: string,
	n: string,
	year: string,
	set: string,
	parallel: string | null = null,
	serial: string | null = null,
): Card => ({ f, n, year, set, parallel, serial });

const R = {
	harp2: c("01-harper-baserc.jpg", "Bryce Harper", "2011", "Bowman Chrome"),
	cole: c("02-cole-auto-ref.jpg", "Gerrit Cole", "2013", "Bowman Chrome", "Refractor", "/500"),
	harper: c("03-harper-purple.jpg", "Bryce Harper", "2021", "Topps Chrome", "Purple"),
	durant: c("04-durant-rookie.jpg", "Kevin Durant", "2007", "Topps"),
	nash: c("05-nash-1957-fix.jpg", "Steve Nash", "2007", "Topps Chrome", "1957-58 Variation"),
	jones: c("06-jones-blue-wave.jpg", "Daniel Jones", "2023", "Panini Prizm", "Blue Wave", "/199"),
	judge: c("07-judge-bdpp19.jpg", "Aaron Judge", "2013", "Bowman Chrome", "Refractor"),
	crosby: c("08-crosby-victory.jpg", "Sidney Crosby", "2006", "UD Ultimate Victory", "Gold", "/25"),
	mcg: c("09-CTRL-mcgaffigan.jpg", "Andy McGaffigan", "1988", "Topps"),
	schaef: c("10-CTRL-schaefer.jpg", "Jeff Schaefer", "1990", "Topps"),
} as const;

/** The measured worst case: 4.2% of 2015-onward sets wrap to five lines. It is on
 *  the page so the wrap is visible here, not only in the round that found it. */
const WORST = "Upper Deck Tim Hortons Team Canada Gold Medalist";

/** Public-domain scans. The IMAGES are real; this metadata is placeholder. */
const L: Card[] = Array.from({ length: 12 }, (_, i) =>
	c(
		`loc-${String(i + 1).padStart(2, "0")}.jpg`,
		"Unidentified",
		"c.1911",
		i === 4 ? WORST : "Benjamin K. Edwards Collection",
		i === 4 ? "Gold" : null,
		i === 4 ? "/25" : null,
	),
);

/** `noUncheckedIndexedAccess` is on, so indexing is a real question rather than a
 *  formality. These indices are fixed and in range; the guard makes that checked. */
function at<T>(xs: readonly T[], i: number): T {
	const v = xs[i];
	if (v === undefined) throw new RangeError(`index ${i} is outside a ${xs.length}-item list`);
	return v;
}
const loc = (i: number): Card => at(L, i);

const POOL: Card[] = [
	R.jones,
	loc(0),
	R.durant,
	loc(1),
	R.mcg,
	loc(2),
	R.cole,
	loc(3),
	R.nash,
	loc(4),
	R.harp2,
	R.judge,
	R.crosby,
	loc(5),
	loc(6),
	loc(7),
	R.harper,
	R.schaef,
	loc(8),
	loc(9),
	loc(10),
	loc(11),
];

/** A collection that runs out mid-page, so the tail is present on the assembled view. */
export function buildSpreads(per: number, pages: number, first?: Spread): Spread[] {
	const total = per * pages - Math.round(per * 0.7);
	const slot = (i: number): Slot => (i < total ? at(POOL, (i * 3 + 7) % POOL.length) : null);
	const page = (k: number): Slot[] => Array.from({ length: per }, (_, i) => slot(k * per + i));
	const spreads: Spread[] = Array.from({ length: Math.ceil(pages / 2) }, (_, k) => ({
		l: page(k * 2),
		r: page(k * 2 + 1),
	}));
	// 4-pocket is the display mode, so its opening spread is dealt rather than
	// generated: the cases the captions send you to look at have to be ON it.
	if (first) spreads[0] = first;
	return spreads;
}

export const FOUR_POCKET_OPENER: Spread = {
	l: [R.crosby, R.harper, R.jones, loc(4)],
	r: [R.durant, R.nash, R.judge, R.mcg],
};
