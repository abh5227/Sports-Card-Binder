/**
 * The database connection.
 *
 * Stage B proves the connection opens and nothing more. There is no schema yet —
 * no tables, no migrations. When the schema arrives it carries the tier boundary
 * described in CLAUDE.md: `card`/`set`/`player` are refreshable catalogue data,
 * `holding` is irreplaceable and a catalogue refresh must never touch it.
 */

import { join } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { DATABASE_FILENAME, ensureDataDir } from "./paths.ts";

export type BinderDatabase = {
	/** Drizzle handle — the query layer everything above should use. */
	db: ReturnType<typeof drizzle>;
	/** Raw handle, for pragmas and the eventual backup command. */
	sqlite: Database.Database;
	/** Absolute path to the file on disk. */
	file: string;
};

export function openDatabase(env: NodeJS.ProcessEnv = process.env): BinderDatabase {
	const file = join(ensureDataDir(env), DATABASE_FILENAME);
	const sqlite = new Database(file);

	// WAL: concurrent reads while a write is in flight, and far fewer fsyncs.
	// Safe here precisely because the data directory is NOT under a sync daemon.
	sqlite.pragma("journal_mode = WAL");
	// Off by default in SQLite; the tier boundary depends on real foreign keys.
	sqlite.pragma("foreign_keys = ON");

	return { db: drizzle(sqlite), sqlite, file };
}

/** SQLite version string — used by the health endpoint to prove the link is live. */
export function sqliteVersion(conn: BinderDatabase): string {
	const row = conn.sqlite.prepare("select sqlite_version() as v").get() as { v: string };
	return row.v;
}
