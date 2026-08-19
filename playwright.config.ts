import { tmpdir } from "node:os";
import { join } from "node:path";
import { defineConfig, devices } from "@playwright/test";

const PORT = 8788; // deliberately not 8787, so a dev server can stay running
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
	testDir: "tests/e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
	use: {
		baseURL: BASE_URL,
		trace: "on-first-retry",
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

	// The e2e run performs the documented cold start: build, then serve the build.
	// BINDER_DATA_DIR points at a throwaway directory so a test run can never
	// touch the real collection.
	webServer: {
		command: "npm run build && npm start",
		url: `${BASE_URL}/api/health`,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
		env: {
			PORT: String(PORT),
			BINDER_DATA_DIR: join(tmpdir(), "binder-e2e-data"),
		},
	},
});
