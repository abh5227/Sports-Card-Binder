import { expect, test } from "@playwright/test";

/**
 * The arithmetic the record settled, asserted rather than re-checked by eye.
 *
 * For appearance the looking is the gate and green tests cannot see. These are not
 * appearance. "4-pocket is 9-pocket at 2x" is twelve ratios, and the z-scale is an
 * ordering that holds because of something nobody does — neither is something a
 * person can re-verify every round, forever.
 *
 * These run in Playwright rather than Vitest because both invariants are facts about
 * COMPUTED style. Vitest's node environment performs no layout and resolves no
 * calc(), so it cannot see either one; jsdom would report the unresolved strings and
 * pass on nonsense. A real browser is not a convenience here, it is the requirement.
 */

/** Every item on Round 3's scaling list, as [label, selector, property]. */
const SCALED: [string, string, string][] = [
	["card width", ".card", "width"],
	["card height", ".card", "height"],
	["sleeve inset", ".card", "left"],
	["gutter", ".grid", "gap"],
	["page margin", ".page", "padding-top"],
	["scrim padding", ".rv", "padding-left"],
	["scrim name type", ".rv .n", "font-size"],
	["scrim line type", ".rv .l", "font-size"],
	["scrim hairline", ".rv", "border-top-width"],
	["card radius", ".card", "border-top-left-radius"],
	["pocket mouth", ".mouth", "height"],
	["pocket radius", ".pk", "border-top-left-radius"],
];

test("4-pocket is 9-pocket at exactly 2x, on every item Round 3 listed", async ({ page }) => {
	await page.goto("/");

	const measured = await page.evaluate((items) => {
		const read = (root: string, sel: string, prop: string) => {
			const host = document.querySelector(root);
			if (!host) throw new Error(`missing ${root}`);
			const el = host.querySelector(sel);
			if (!el) throw new Error(`missing ${root} ${sel}`);
			return Number.parseFloat(getComputedStyle(el).getPropertyValue(prop));
		};
		return items.map((item) => ({
			label: item[0],
			nine: read('[data-testid="binder-nine"]', item[1], item[2]),
			four: read('[data-testid="binder-four"]', item[1], item[2]),
		}));
	}, SCALED);

	for (const m of measured) {
		expect(m.nine, `${m.label}: 9-pocket value must be non-zero to divide`).toBeGreaterThan(0);
		// The RATIO is the invariant, not the pair — a future change to a base value
		// should not silently require this test to be rewritten.
		expect(m.four / m.nine, `${m.label} does not scale at 2x`).toBeCloseTo(2, 5);
	}

	// The one base value asserted outright, because it is not a consequence of the
	// scaling rule but a decision in its own right: cards render at true binder
	// scale, 150 x 210 CSS px at 9-pocket.
	const card = await page.locator('[data-testid="binder-nine"] .card').first().boundingBox();
	expect(card?.width).toBeCloseTo(150, 0);
	expect(card?.height).toBeCloseTo(210, 0);
});

test("the reveal wraps and never truncates, on the worst set name in the fixtures", async ({
	page,
}) => {
	await page.goto("/");

	// 4.2% of 2015-onward sets wrap to five lines; this is the measured worst case.
	const WORST = "Upper Deck Tim Hortons Team Canada Gold Medalist";
	const line = page
		.getByTestId("binder-four")
		.locator(".rv .l", { hasText: "Tim Hortons" })
		.first();
	await expect(line).toHaveCount(1);

	const r = await line.evaluate((el) => {
		const cs = getComputedStyle(el);
		return {
			text: el.textContent ?? "",
			overflowing: el.scrollWidth > el.clientWidth + 1,
			lines: Math.round(el.getBoundingClientRect().height / Number.parseFloat(cs.lineHeight)),
			whiteSpace: cs.whiteSpace,
			textOverflow: cs.textOverflow,
		};
	});

	expect(r.text).toContain(WORST); // the whole name is present, not an ellipsis
	expect(r.overflowing, "the set name is being clipped horizontally").toBe(false);
	expect(r.lines, "the set name should wrap to more than one line").toBeGreaterThan(1);
	expect(r.whiteSpace).not.toBe("nowrap");
	expect(r.textOverflow).not.toBe("ellipsis");
});

test("the z-scale holds, and nothing creates a stacking context inside a pocket", async ({
	page,
}) => {
	await page.goto("/");

	const r = await page.evaluate(() => {
		const nine = document.querySelector('[data-testid="binder-nine"]');
		if (!nine) throw new Error("missing 9-pocket section");
		const pk = nine.querySelector(".pk.filled");
		if (!pk) throw new Error("missing a filled pocket");
		const z = (sel: string, root: Element = pk) => {
			const el = root.querySelector(sel);
			if (!el) throw new Error(`missing ${sel}`);
			return getComputedStyle(el).zIndex;
		};
		// walk from the pocket up to the frame, checking nothing isolates
		const chain: {
			tag: string;
			cls: string;
			isolation: string;
			transform: string;
			filter: string;
			opacity: string;
			willChange: string;
			contain: string;
		}[] = [];
		for (let el: Element | null = pk; el && el !== nine; el = el.parentElement) {
			const cs = getComputedStyle(el);
			chain.push({
				tag: el.tagName.toLowerCase(),
				cls: el.className.toString().slice(0, 40),
				isolation: cs.isolation,
				transform: cs.transform,
				filter: cs.filter,
				opacity: cs.opacity,
				willChange: cs.willChange,
				contain: cs.contain,
			});
		}
		return {
			z: {
				well: z(".well"),
				card: z(".card"),
				mouth: z(".mouth"),
				sheen: getComputedStyle(nine.querySelector(".sheet-sheen") as Element).zIndex,
				reveal: z(".rv"),
				lip: z(".lip"),
			},
			chain,
		};
	});

	// Recorded once, in docs/design-decisions.md, because the coupling spans two
	// components: the sheet's specular is page-level and must sit above every
	// pocket's plastic and below the hover reveal.
	expect(r.z).toEqual({
		well: "1",
		card: "2",
		mouth: "2",
		sheen: "3",
		reveal: "4",
		lip: "5",
	});

	// The negative invariant. "Do not give a pocket its own stacking context" —
	// isolating one lifts the page's specular above everything inside it, including
	// the reveal, and re-breaks "UI sits above the plastic". It currently holds
	// because nobody has done it, which is precisely why it needs a test.
	for (const el of r.chain) {
		const where = `${el.tag}.${el.cls}`;
		expect(el.isolation, `${where} isolates`).toBe("auto");
		expect(el.transform, `${where} has a transform`).toBe("none");
		expect(el.filter, `${where} has a filter`).toBe("none");
		expect(el.opacity, `${where} is not fully opaque`).toBe("1");
		expect(el.willChange, `${where} declares will-change`).toBe("auto");
		expect(el.contain, `${where} declares contain`).toBe("none");
	}
});
