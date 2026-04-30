import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryRoot = fileURLToPath(new URL("../..", import.meta.url));
const serverModulesRoot = path.join(repositoryRoot, "apps/server/src/modules");
const frontendFeaturesRoot = path.join(repositoryRoot, "apps/frontend/features");

const backendModules = ["common", "companies", "industries", "tenants"] as const;
const frontendFeatures = ["common", "company", "cxsun", "desk", "industry", "tenant"] as const;
const frontendApplicationFiles = [
  "common/application/common-service.ts",
  "common/location/application/common-location-service.ts",
  "company/application/company-service.ts",
  "industry/application/industry-service.ts",
  "tenant/application/tenant-service.ts",
] as const;
const publicEntrypoints = [
  "apps/frontend/features/common/interface/pages/common-pages.tsx",
  "apps/frontend/features/company/interface/pages/company-pages.tsx",
  "apps/frontend/features/industry/interface/pages/industry-pages.tsx",
  "apps/frontend/features/tenant/interface/pages/tenant-pages.tsx",
  "packages/ui/src/blocks/dashboard/dashboard-shell.tsx",
] as const;

async function exists(root: string, relativePath: string): Promise<boolean> {
  try {
    await access(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

const generatedSourceSuffixes = [".js", ".js.map", ".d.ts", ".d.ts.map"] as const;
const ignoredDirectoryNames = new Set(["node_modules", "dist", ".next", "out", "temp", ".turbo"]);

function toPosixPath(value: string): string {
  return value.split(path.sep).join("/");
}

async function collectGeneratedSourceArtifacts(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const artifacts: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (!ignoredDirectoryNames.has(entry.name)) {
        artifacts.push(...(await collectGeneratedSourceArtifacts(entryPath)));
      }
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const relativePath = toPosixPath(path.relative(repositoryRoot, entryPath));

    if (
      relativePath.includes("/src/") &&
      generatedSourceSuffixes.some((suffix) => relativePath.endsWith(suffix))
    ) {
      artifacts.push(relativePath);
    }
  }

  return artifacts;
}

describe("final boundary enforcement", () => {
  it("keeps backend bounded contexts in strict module folders", async () => {
    const requiredPaths = backendModules.flatMap((moduleKey) => [
      `${moduleKey}/domain`,
      `${moduleKey}/application`,
      `${moduleKey}/infrastructure`,
      `${moduleKey}/interface`,
      `${moduleKey}/database`,
    ]);

    await expect(
      Promise.all(requiredPaths.map((requiredPath) => exists(serverModulesRoot, requiredPath))),
    ).resolves.toEqual(requiredPaths.map(() => true));
  });

  it("keeps frontend features in strict feature folders", async () => {
    const requiredPaths = frontendFeatures.flatMap((featureKey) => [
      `${featureKey}/domain`,
      `${featureKey}/application`,
      `${featureKey}/infrastructure`,
      `${featureKey}/interface`,
    ]);

    await expect(
      Promise.all(requiredPaths.map((requiredPath) => exists(frontendFeaturesRoot, requiredPath))),
    ).resolves.toEqual(requiredPaths.map(() => true));
  });

  it("keeps frontend application services free from browser and network adapters", async () => {
    await Promise.all(
      frontendApplicationFiles.map(async (applicationFile) => {
        const source = await readFile(path.join(frontendFeaturesRoot, applicationFile), "utf8");

        expect(source, applicationFile).not.toContain("fetch(");
        expect(source, applicationFile).not.toContain("process.env");
        expect(source, applicationFile).not.toContain("window.");
      }),
    );
  });

  it("keeps public route/package entrypoints below the file-size threshold", async () => {
    await Promise.all(
      publicEntrypoints.map(async (entrypoint) => {
        const source = await readFile(path.join(repositoryRoot, entrypoint), "utf8");

        expect(source.split(/\r?\n/).length, entrypoint).toBeLessThan(700);
      }),
    );
  });

  it("keeps generated source artifacts out of the repository tree", async () => {
    const artifactGroups = await Promise.all(
      ["apps", "packages"].map((scanRoot) =>
        collectGeneratedSourceArtifacts(path.join(repositoryRoot, scanRoot)),
      ),
    );

    expect(artifactGroups.flat().sort()).toEqual([]);
  });
});
