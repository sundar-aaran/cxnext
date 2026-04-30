import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryRoot = fileURLToPath(new URL("../..", import.meta.url));
const modulesRoot = path.join(repositoryRoot, "apps/server/src/modules");

async function collectDomainFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return collectDomainFiles(entryPath);
      }

      return entry.isFile() && entry.name.endsWith(".ts") ? [entryPath] : [];
    }),
  );

  return nestedFiles.flat();
}

describe("backend domain import boundaries", () => {
  it("keeps backend domain files free from framework and infrastructure imports", async () => {
    const moduleEntries = await readdir(modulesRoot, { withFileTypes: true });
    const domainFiles = (
      await Promise.all(
        moduleEntries
          .filter((entry) => entry.isDirectory())
          .map((entry) => collectDomainFiles(path.join(modulesRoot, entry.name, "domain"))),
      )
    ).flat();

    await Promise.all(
      domainFiles.map(async (domainFile) => {
        const source = await readFile(domainFile, "utf8");

        expect(source, path.relative(repositoryRoot, domainFile)).not.toMatch(/@nestjs\//);
        expect(source, path.relative(repositoryRoot, domainFile)).not.toMatch(
          /\/infrastructure\/|\/interface\/|\/database\//,
        );
      }),
    );
  });
});
