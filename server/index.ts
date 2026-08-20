/**
 * The API server.
 *
 * Small on purpose, and describing what it does rather than which stage it is at —
 * a comment pinned to a stage number reads as stale long before it reads as wrong.
 *
 * It serves two things: the Vite build out of dist/, and one health endpoint. It
 * serves NO card data — the binder currently renders hardcoded fixtures in the
 * frontend, and there is no schema for it to read from yet.
 *
 * The health endpoint is not decoration. It proves the chain Node -> Fastify ->
 * better-sqlite3 -> a file in $BINDER_DATA_DIR actually opens, it prints the
 * resolved data directory on startup, and Playwright waits on it before running
 * the e2e suite.
 *
 * Runs straight from TypeScript source — Node 24 strips the types. See tsconfig's
 * erasableSyntaxOnly, which keeps that guarantee checked.
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import fastifyStatic from "@fastify/static";
import Fastify from "fastify";
import { openDatabase, sqliteVersion } from "./db.ts";
import { resolveDataDir } from "./paths.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const DIST = join(HERE, "..", "dist");
const PORT = Number(process.env.PORT ?? 8787);
const HOST = process.env.HOST ?? "127.0.0.1";

export async function buildServer() {
	const app = Fastify({ logger: false });
	const conn = openDatabase();

	app.get("/api/health", () => ({
		ok: true,
		node: process.version,
		sqlite: sqliteVersion(conn),
		dataDir: resolveDataDir(),
		databaseFile: conn.file,
	}));

	// Serve the Vite build. `npm run build` must have produced dist/ — CI runs the
	// documented cold start end to end so this cannot silently rot.
	await app.register(fastifyStatic, { root: DIST, index: ["index.html"] });

	app.setNotFoundHandler((request, reply) => {
		if (request.url.startsWith("/api/")) {
			return reply.code(404).send({ ok: false, error: "no such endpoint" });
		}
		return reply.sendFile("index.html");
	});

	app.addHook("onClose", () => {
		conn.sqlite.close();
	});

	return app;
}

// Only listen when run directly, so tests can import buildServer() without a port.
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
	const app = await buildServer();
	await app.listen({ port: PORT, host: HOST });
	const health = await app.inject({ method: "GET", url: "/api/health" });
	const info = health.json() as { dataDir: string; sqlite: string };
	console.log(`Sports Card Binder  http://${HOST}:${PORT}`);
	console.log(`  data directory    ${info.dataDir}`);
	console.log(`  sqlite            ${info.sqlite}`);
}
