import { createReadStream, existsSync } from "node:fs";
import { resolve } from "node:path";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";

const API_PORT = Number(process.env.PORT ?? 8787);

/**
 * Card images are DEV-ONLY static, and deliberately never bundled.
 *
 * The scans under preview/img are copyright-encumbered and git-ignored — they must
 * never enter the repo, and a Vite `publicDir` would copy them into dist/ on every
 * build. This serves them straight off disk during development instead, so the
 * binder can be looked at without the images ever becoming a build artifact.
 */
function devCardImages(): Plugin {
	return {
		name: "binder-dev-card-images",
		apply: "serve",
		configureServer(server) {
			server.middlewares.use("/img", (req, res, next) => {
				const name = decodeURIComponent((req.url ?? "").split("?")[0] ?? "").replace(/^\//, "");
				if (!/^[\w.-]+\.jpg$/.test(name)) return next();
				const file = resolve(import.meta.dirname, "preview/img", name);
				if (!existsSync(file)) return next();
				res.setHeader("Content-Type", "image/jpeg");
				createReadStream(file).pipe(res);
			});
		},
	};
}

export default defineConfig({
	plugins: [svelte(), devCardImages()],
	build: {
		outDir: "dist",
		emptyOutDir: true,
	},
	server: {
		// `npm run dev` serves the frontend with HMR and forwards the API to the
		// Node server from `npm run dev:server`. In production the Node server
		// serves dist/ itself and this proxy is not involved.
		proxy: {
			"/api": { target: `http://127.0.0.1:${API_PORT}`, changeOrigin: false },
		},
	},
	test: {
		// Unit tests only. End-to-end lives in tests/e2e and is run by Playwright,
		// which needs a real browser and a real server.
		include: ["tests/unit/**/*.test.ts"],
		environment: "node",
	},
});
