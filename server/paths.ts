/**
 * Where the collection lives.
 *
 * The data directory is deliberately OUTSIDE the repository — this repo is public
 * and the collection is personal and irreplaceable. Every path into it resolves
 * through here; nothing else builds data paths by hand.
 *
 * See CLAUDE.md — the data must never sit inside an iCloud-synced tree.
 */
import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";

/** Default when BINDER_DATA_DIR is unset. A default, not a lock-in. */
export const DEFAULT_DATA_DIR = join(homedir(), "Developer", "binder-data");

/** The database filename inside the data directory. */
export const DATABASE_FILENAME = "binder.db";

/**
 * Resolve the data directory from the environment.
 *
 * Pure: takes the environment rather than reading it, so it is testable without
 * mutating process.env. Returns an absolute path. Expands a leading `~/`, which
 * a shell would not expand inside a quoted assignment.
 */
export function resolveDataDir(env: NodeJS.ProcessEnv = process.env): string {
	const raw = env.BINDER_DATA_DIR?.trim();
	if (!raw) return DEFAULT_DATA_DIR;

	const expanded = raw === "~" || raw.startsWith("~/") ? join(homedir(), raw.slice(1)) : raw;

	return isAbsolute(expanded) ? expanded : resolve(expanded);
}

/** Absolute path to the database file, without creating anything. */
export function resolveDatabasePath(env: NodeJS.ProcessEnv = process.env): string {
	return join(resolveDataDir(env), DATABASE_FILENAME);
}

/** Resolve the data directory and create it if it does not exist yet. */
export function ensureDataDir(env: NodeJS.ProcessEnv = process.env): string {
	const dir = resolveDataDir(env);
	mkdirSync(dir, { recursive: true });
	return dir;
}
