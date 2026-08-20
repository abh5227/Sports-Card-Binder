import { expect, test } from "@playwright/test";

/**
 * The binder renders, from the real built bundle, served by the real Node server.
 *
 * This replaced a Stage B placeholder that asserted the health panel was on screen.
 * The panel is gone because the page is now the binder, so the UI assertions moved
 * to the binder and the API assertion below stands on its own — it never needed the
 * UI to prove the server opened SQLite.
 */
test("the binder renders both layouts, in the real build", async ({ page }) => {
	await page.goto("/");

	await expect(page.getByRole("heading", { name: "Sports Card Binder" })).toBeVisible();

	const nine = page.getByTestId("binder-nine");
	const four = page.getByTestId("binder-four");
	await expect(nine).toBeVisible();
	await expect(four).toBeVisible();

	// Nine pockets a page. The leaf carries two more pages, so a spread renders
	// four: the two on show and the two on the turning leaf.
	await expect(nine.locator(".pk")).toHaveCount(36);
	await expect(four.locator(".pk")).toHaveCount(16);

	// 4-pocket is 9-pocket at 2x — the one rule that decides the second layout.
	const ninePocket = await nine.locator(".pk").first().boundingBox();
	const fourPocket = await four.locator(".pk").first().boundingBox();
	expect(ninePocket?.width).toBeCloseTo(164, 0); // 150 card + 2 x 7 sleeve inset
	expect(fourPocket?.width).toBeCloseTo(328, 0);
});

test("a page turn advances the spread and the ends refuse", async ({ page }) => {
	await page.goto("/");
	const nine = page.getByTestId("binder-nine");
	const where = nine.locator(".where");

	await expect(where).toContainText("spread 1 of 3");

	// Back at the first spread has nothing to turn: it must refuse, not wrap.
	await nine.getByRole("button", { name: "Back" }).click();
	await expect(where).toContainText("spread 1 of 3");

	await nine.getByRole("button", { name: "Next" }).click();
	await expect(where).toContainText("spread 2 of 3");
});

test("the health endpoint reports a data directory outside the repo", async ({ request }) => {
	const res = await request.get("/api/health");
	expect(res.ok()).toBe(true);

	const body = (await res.json()) as { ok: boolean; dataDir: string; databaseFile: string };
	expect(body.ok).toBe(true);
	expect(body.dataDir).not.toContain("Sports-Card-Binder");
	expect(body.databaseFile.endsWith("binder.db")).toBe(true);
});
