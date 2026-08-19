import { expect, test } from "@playwright/test";

/**
 * Stage B's whole claim is "the toolchain runs end to end". This is the test that
 * makes that claim falsifiable: a real browser, against the real built bundle,
 * served by the real Node server, reading a real SQLite file.
 */
test("the placeholder page renders and the API is connected", async ({ page }) => {
	await page.goto("/");

	await expect(page.getByRole("heading", { name: "Sports Card Binder" })).toBeVisible();

	// Proves Svelte mounted, the fetch resolved, and the server opened SQLite.
	await expect(page.getByTestId("health-ok")).toBeVisible();
	await expect(page.getByTestId("health-error")).toHaveCount(0);

	const health = page.getByTestId("health");
	await expect(health).toContainText("v24.");
	await expect(health).toContainText(/\d+\.\d+\.\d+/); // sqlite version
});

test("the health endpoint reports a data directory outside the repo", async ({ request }) => {
	const res = await request.get("/api/health");
	expect(res.ok()).toBe(true);

	const body = (await res.json()) as { ok: boolean; dataDir: string; databaseFile: string };
	expect(body.ok).toBe(true);
	expect(body.dataDir).not.toContain("Sports-Card-Binder");
	expect(body.databaseFile.endsWith("binder.db")).toBe(true);
});

test("an unknown API route 404s as JSON rather than serving the app shell", async ({ request }) => {
	const res = await request.get("/api/nope");
	expect(res.status()).toBe(404);
	expect((await res.json()).ok).toBe(false);
});
