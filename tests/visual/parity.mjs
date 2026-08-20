/**
 * Port parity gate — does the real stack still reproduce the preview it was ported
 * from? Run this by hand before each stage's review, and read the result before
 * anyone looks at the build.
 *
 *   node tests/visual/parity.mjs "$PWD"      (with `npm run dev` already running)
 *
 * ---------------------------------------------------------------------------
 * THIS GATE CANNOT RUN IN CI, AND THAT IS A ROT RISK, NOT A DETAIL.
 *
 * It needs two things CI does not have: a Vite dev server, and the card images —
 * which are copyright-encumbered and will never be in this repository. So it is a
 * documented manual step, and a documented manual step is exactly what left Chef's
 * Choice's README broken for six weeks on a project run with more discipline than
 * most. Nobody performed it because nothing made them.
 *
 * The fix is not a reminder. It is to make the gate automatable:
 *
 *   D12 already records that a public repo needs a demo dataset, and that the
 *   public-domain Library of Congress scans are the intended one — those CAN be
 *   committed. If that dataset lands, a reduced parity run against demo cards
 *   becomes CI-able and this comment can be deleted. The demo-dataset debt now has
 *   a second reason to exist, and this is it.
 *
 * ---------------------------------------------------------------------------
 * TWO EXACT GATES, NO THRESHOLD TO INTERPRET.
 *
 * Chromium DITHERS a linear-gradient by up to 1/255, and the dither pattern is not
 * reproducible between two documents even when the element's box, its computed
 * gradient and its absolute position are all identical. That showed up as a stable
 * 13.7% of pixels differing by exactly 1, in a 122-degree stripe over the left
 * page's sheen and nowhere else — visible in a diff map, and unmoved by snapping
 * either frame to the pixel grid or onto the same absolute coordinate.
 *
 * So a whole-image pixel diff cannot reach zero here, and a tolerance would be a
 * judgement call re-made by whoever runs it next. Instead:
 *
 *   GATE 1  pixels, with the sheen suppressed          -> must be exactly 0
 *   GATE 2  the sheen's box and computed gradient      -> must be exactly equal
 *
 * Together these are STRICTER than a tolerance, because gate 2 checks the things
 * that could actually drift — the stops, the angle, the geometry — rather than
 * accepting noise across the region that contains them.
 */

import { createReadStream, mkdirSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";

const OUT = join(tmpdir(), "binder-parity");
mkdirSync(OUT, { recursive: true });
const REPO = process.argv[2];
const PAIRS = [
	{ name: "9-pocket", a: "#nine .frame", b: '[data-testid="binder-nine"] .frame' },
	{ name: "4-pocket", a: "#four .frame", b: '[data-testid="binder-four"] .frame' },
];
const b = await chromium.launch();

async function capture(tag, url, sel) {
	const p = await b.newPage({ viewport: { width: 1700, height: 1400 }, deviceScaleFactor: 1 });
	const errs = [];
	p.on("pageerror", (e) => errs.push(e.message));
	await p.goto(url);
	await p.waitForTimeout(1500);
	const sheen = await p.evaluate((s) => {
		const frame = document.querySelector(s);
		const f = (e) => {
			const r = e.getBoundingClientRect();
			return [+r.width.toFixed(4), +r.height.toFixed(4)];
		};
		return [...frame.querySelectorAll(".sheet-sheen")].map((sh) => {
			const i = sh.querySelector("i"),
				cs = getComputedStyle(i);
			return {
				box: f(sh),
				band: f(i),
				grad: cs.backgroundImage,
				z: getComputedStyle(sh).zIndex,
				overflow: getComputedStyle(sh).overflow,
			};
		});
	}, sel);
	await p.evaluate((s) => {
		const frame = document.querySelector(s);
		for (const e of frame.querySelectorAll(".sheet-sheen")) e.style.display = "none";
		frame.scrollIntoView({ block: "start" });
		const r = frame.getBoundingClientRect();
		frame.style.marginTop = `${Math.ceil(r.y) - r.y}px`;
	}, sel);
	await p.waitForTimeout(250);
	await p
		.locator(sel)
		.first()
		.screenshot({ path: `${OUT}/${tag}.png` });
	await p.close();
	return { sheen, errs };
}

const shots = [];
for (const pr of PAIRS) {
	shots.push({
		pr,
		A: await capture(`a-${pr.name}`, `file://${REPO}/preview/locked.html`, pr.a),
		B: await capture(`b-${pr.name}`, "http://localhost:5173/", pr.b),
	});
}

const p = await b.newPage({ viewport: { width: 900, height: 600 } });
// The comparison reads pixels back through a canvas, and file:// taints it
// cross-origin, so the captures are served over http from a throwaway server.
const srv = createServer((req, res) => {
	const name = (req.url || "").replace(/^\//, "").split("?")[0];
	if (!/^[\w.-]+\.png$/.test(name)) {
		res.writeHead(404);
		return res.end();
	}
	res.writeHead(200, { "Content-Type": "image/png" });
	createReadStream(join(OUT, name)).pipe(res);
});
await new Promise((r) => srv.listen(0, "127.0.0.1", r));
const PORT = srv.address().port;
await p.goto(`http://127.0.0.1:${PORT}/`);
let fail = 0;
for (const { pr, A, B } of shots) {
	const r = await p.evaluate(async (n) => {
		const load = (u) =>
			new Promise((res, rej) => {
				const i = new Image();
				i.onload = () => res(i);
				i.onerror = rej;
				i.src = u;
			});
		const [X, Y] = await Promise.all([load(`/a-${n}.png`), load(`/b-${n}.png`)]);
		if (X.width !== Y.width || X.height !== Y.height)
			return { fail: "size", a: [X.width, X.height], b: [Y.width, Y.height] };
		const px = (d) => {
			const c = document.createElement("canvas");
			c.width = X.width;
			c.height = X.height;
			const g = c.getContext("2d", { willReadFrequently: true });
			g.drawImage(d, 0, 0);
			return g.getImageData(0, 0, X.width, X.height).data;
		};
		const da = px(X),
			db = px(Y);
		let n2 = 0,
			mx = 0,
			first = null;
		for (let i = 0; i < da.length; i += 4) {
			const d = Math.max(
				Math.abs(da[i] - db[i]),
				Math.abs(da[i + 1] - db[i + 1]),
				Math.abs(da[i + 2] - db[i + 2]),
			);
			if (d > 0) {
				n2++;
				if (d > mx) mx = d;
				if (!first) first = { x: (i / 4) % X.width, y: Math.floor(i / 4 / X.width), d };
			}
		}
		return { w: X.width, h: X.height, total: X.width * X.height, n: n2, mx, first };
	}, pr.name);
	const g2ok = JSON.stringify(A.sheen) === JSON.stringify(B.sheen);
	const g1ok = !r.fail && r.n === 0;
	if (!g1ok || !g2ok) fail++;
	console.log(`\n${pr.name}  ${r.w}x${r.h}`);
	console.log(
		`  GATE 1  pixels, sheen suppressed : ${
			r.fail ? `SIZE MISMATCH ${JSON.stringify(r)}` : `${r.n} differing, max delta ${r.mx}`
		}  ${g1ok ? "PASS" : "FAIL"}`,
	);
	if (r.first)
		console.log(`          first difference at x${r.first.x} y${r.first.y} delta ${r.first.d}`);
	console.log(
		`  GATE 2  sheen box + gradient     : ${A.sheen.length} bands compared  ${g2ok ? "PASS" : "FAIL"}`,
	);
	if (!g2ok) {
		console.log("    preview", JSON.stringify(A.sheen));
		console.log("    port   ", JSON.stringify(B.sheen));
	}
	for (const e of [...A.errs, ...B.errs]) console.log("  PAGE ERROR:", e);
}
console.log(
	`\n${fail ? `${fail} PAIR(S) FAILED` : "ALL GATES PASS — the port reproduces the preview"}`,
);
await b.close();
srv.close();
process.exit(fail ? 1 : 0);
