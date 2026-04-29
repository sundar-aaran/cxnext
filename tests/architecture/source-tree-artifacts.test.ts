import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const generatedSourceSuffixes = [".js", ".js.map", ".d.ts", ".d.ts.map"];
const ignoredDirectoryNames = new Set(["node_modules", "dist", ".next", "out", "temp", ".turbo"]);
const scanRoots = ["apps", "packages"];

function toPosixPath(value: string): string {
  return value.split(path.sep).join("/");
}

function isGeneratedSourceArtifact(relativePath: string): boolean {
  return generatedSourceSuffixes.some((suffix) => relativePath.endsWith(suffix));
}

async function collectGeneratedSourceArtifacts(
  currentDirectory: string,
  repositoryRoot: string,
): Promise<string[]> {
  const entries = await readdir(currentDirectory, { withFileTypes: true });
  const artifacts: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(currentDirectory, entry.name);

    if (entry.isDirectory()) {
      if (ignoredDirectoryNames.has(entry.name)) {
        continue;
      }

      artifacts.push(...(await collectGeneratedSourceArtifacts(entryPath, repositoryRoot)));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const relativePath = toPosixPath(path.relative(repositoryRoot, entryPath));

    if (!relativePath.includes("/src/")) {
      continue;
    }

    if (!isGeneratedSourceArtifact(relativePath)) {
      continue;
    }

    artifacts.push(relativePath);
  }

  return artifacts;
}

describe("source tree artifacts", () => {
  it("does not contain generated output under app and package src directories", async () => {
    const repositoryRoot = fileURLToPath(new URL("../..", import.meta.url));
    const artifactGroups = await Promise.all(
      scanRoots.map((root) =>
        collectGeneratedSourceArtifacts(path.join(repositoryRoot, root), repositoryRoot),
      ),
    );

    expect(artifactGroups.flat().sort()).toEqual([]);
  });
});
