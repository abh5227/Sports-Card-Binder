import { homedir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DEFAULT_DATA_DIR, resolveDatabasePath, resolveDataDir } from "../../server/paths.ts";

/**
 * The data directory is the one place a mistake puts personal data somewhere it
 * should not be — inside the public repo, or inside an iCloud-synced tree. So the
 * resolver is the piece worth testing first, even at Stage B.
 */
describe("resolveDataDir", () => {
	it("falls back to the default when BINDER_DATA_DIR is unset", () => {
		expect(resolveDataDir({})).toBe(DEFAULT_DATA_DIR);
		expect(DEFAULT_DATA_DIR).toBe(join(homedir(), "Developer", "binder-data"));
	});

	it("treats blank or whitespace-only as unset rather than as the current directory", () => {
		expect(resolveDataDir({ BINDER_DATA_DIR: "" })).toBe(DEFAULT_DATA_DIR);
		expect(resolveDataDir({ BINDER_DATA_DIR: "   " })).toBe(DEFAULT_DATA_DIR);
	});

	it("honours an absolute override", () => {
		expect(resolveDataDir({ BINDER_DATA_DIR: "/tmp/binder" })).toBe("/tmp/binder");
	});

	it("expands a leading ~, which a quoted shell assignment would not", () => {
		expect(resolveDataDir({ BINDER_DATA_DIR: "~/elsewhere" })).toBe(join(homedir(), "elsewhere"));
	});

	it("returns an absolute path even for a relative override", () => {
		const resolved = resolveDataDir({ BINDER_DATA_DIR: "./local-data" });
		expect(resolved.startsWith("/")).toBe(true);
		expect(resolved.endsWith("local-data")).toBe(true);
	});

	it("puts the database inside the resolved directory", () => {
		expect(resolveDatabasePath({ BINDER_DATA_DIR: "/tmp/binder" })).toBe("/tmp/binder/binder.db");
	});

	it("never resolves inside the repository itself", () => {
		// The guarantee that matters: this repo is public, the collection is not.
		expect(resolveDataDir({}).includes("Sports-Card-Binder")).toBe(false);
	});
});
