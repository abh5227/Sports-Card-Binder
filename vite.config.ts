import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

const API_PORT = Number(process.env.PORT ?? 8787);

export default defineConfig({
	plugins: [svelte()],
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
