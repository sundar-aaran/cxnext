import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryRoot = fileURLToPath(new URL("../..", import.meta.url));
const serverModulesRoot = path.join(repositoryRoot, "apps/server/src/modules");
const frontendAppRoot = path.join(repositoryRoot, "apps/frontend/app");

async function collectFiles(directory: string, suffixes: readonly string[]): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return collectFiles(entryPath, suffixes);
      }

      return entry.isFile() && suffixes.some((suffix) => entry.name.endsWith(suffix))
        ? [entryPath]
        : [];
    }),
  );

  return nestedFiles.flat();
}

describe("route and module boundaries", () => {
  it("keeps backend HTTP controllers from injecting repositories directly", async () => {
    const controllerFiles = await collectFiles(serverModulesRoot, [".controller.ts"]);

    await Promise.all(
      controllerFiles.map(async (controllerFile) => {
        const source = await readFile(controllerFile, "utf8");
        const relativeFile = path.relative(repositoryRoot, controllerFile);

        expect(source, relativeFile).not.toMatch(/_REPOSITORY/);
        expect(source, relativeFile).not.toMatch(/Repository\b/);
      }),
    );
  });

  it("keeps frontend app routes away from feature infrastructure and implementation roots", async () => {
    const routeFiles = await collectFiles(frontendAppRoot, [".tsx"]);

    await Promise.all(
      routeFiles.map(async (routeFile) => {
        const source = await readFile(routeFile, "utf8");
        const relativeFile = path.relative(repositoryRoot, routeFile);

        expect(source, relativeFile).not.toMatch(/features\/[^"']+\/infrastructure\//);
        expect(source, relativeFile).not.toMatch(/-pages-root/);
        expect(source, relativeFile).not.toMatch(/dashboard-shell-root/);
      }),
    );
  });
});
