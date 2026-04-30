import { stat, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryRoot = fileURLToPath(new URL("../..", import.meta.url));
const dashboardShellPath = path.join(
  repositoryRoot,
  "packages/ui/src/blocks/dashboard/dashboard-shell.tsx",
);

describe("dashboard shell public boundary", () => {
  it("keeps the public dashboard shell entrypoint small", async () => {
    const source = await readFile(dashboardShellPath, "utf8");

    expect(source.split(/\r?\n/).length).toBeLessThan(40);
    expect(source).toContain("DashboardShell");
    expect(source).toContain("DashboardShellProps");
  });

  it("keeps the public dashboard shell entrypoint lightweight", async () => {
    const file = await stat(dashboardShellPath);

    expect(file.size).toBeLessThan(500);
  });
});
