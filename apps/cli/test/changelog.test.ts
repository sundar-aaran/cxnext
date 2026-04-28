import { describe, expect, it } from "vitest";
import { formatChangelogCommitSubject, parseLatestChangelogEntry } from "../src/changelog.mjs";

describe("github helper changelog parsing", () => {
  it("uses the latest versioned changelog title as the commit subject", () => {
    const entry = parseLatestChangelogEntry(`
# Changelog

## v-1.0.4

### [v 1.0.4] 2026-04-28 - Add GitHub Helper CLI

- Added helper.

## v-1.0.3

### [v 1.0.3] 2026-04-28 - Update Workspace Dependencies
`);

    expect(entry).toEqual({ reference: 4, title: "Add GitHub Helper CLI" });
    expect(formatChangelogCommitSubject(entry)).toBe("#4 chore: Add GitHub Helper CLI");
  });
});
