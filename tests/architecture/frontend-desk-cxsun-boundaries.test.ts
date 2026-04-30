import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryRoot = fileURLToPath(new URL("../..", import.meta.url));
const featuresRoot = path.join(repositoryRoot, "apps/frontend/features");
const appRoot = path.join(repositoryRoot, "apps/frontend");

async function exists(relativePath: string): Promise<boolean> {
  try {
    await access(path.join(featuresRoot, relativePath));
    return true;
  } catch {
    return false;
  }
}

describe("frontend desk and cxsun boundaries", () => {
  it("keeps desk and cxsun in strict frontend feature folders", async () => {
    const requiredPaths = ["desk", "cxsun"].flatMap((featureKey) => [
      `${featureKey}/domain`,
      `${featureKey}/application`,
      `${featureKey}/infrastructure`,
      `${featureKey}/interface`,
    ]);

    await expect(
      Promise.all(requiredPaths.map((requiredPath) => exists(requiredPath))),
    ).resolves.toEqual(requiredPaths.map(() => true));
  });

  it("removes the old flat feature entry files", async () => {
    const oldFlatFiles = [
      "desk/desk-shell.tsx",
      "desk/desk-registry.tsx",
      "desk/desk-breadcrumb.tsx",
      "cxsun/cxsun-workspace.tsx",
      "cxsun/data.ts",
      "cxsun/mappers.ts",
    ];

    await expect(
      Promise.all(oldFlatFiles.map((oldFlatFile) => exists(oldFlatFile))),
    ).resolves.toEqual(oldFlatFiles.map(() => false));
  });

  it("keeps app routes pointed at interface/application feature surfaces", async () => {
    const routeFiles = [
      "app/(app)/layout.tsx",
      "app/(app)/desk/[portal]/page.tsx",
      "app/(app)/desk/[portal]/[section]/page.tsx",
      "app/(app)/desk/[portal]/records/[recordId]/page.tsx",
      "app/(app)/desk/[portal]/records/new/page.tsx",
      "components/dashboard/desk-dashboard.tsx",
    ];

    await Promise.all(
      routeFiles.map(async (routeFile) => {
        const source = await readFile(path.join(appRoot, routeFile), "utf8");

        expect(source, routeFile).not.toMatch(/features\/(?:desk|cxsun)\/(?:desk|cxsun|data|mappers)/);
      }),
    );
  });
});
