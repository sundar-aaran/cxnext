import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryRoot = fileURLToPath(new URL("../..", import.meta.url));
const commonLocationRoot = path.join(repositoryRoot, "apps/frontend/features/common/location");

async function exists(relativePath: string): Promise<boolean> {
  try {
    await access(path.join(commonLocationRoot, relativePath));
    return true;
  } catch {
    return false;
  }
}

describe("frontend common location boundaries", () => {
  it("keeps location as a strict nested frontend feature", async () => {
    const requiredPaths = [
      "domain",
      "application",
      "infrastructure",
      "interface/pages",
    ];

    await expect(
      Promise.all(requiredPaths.map((requiredPath) => exists(requiredPath))),
    ).resolves.toEqual(requiredPaths.map(() => true));
  });

  it("keeps location fetch adapter code in infrastructure", async () => {
    const applicationSource = await readFile(
      path.join(commonLocationRoot, "application/common-location-service.ts"),
      "utf8",
    );
    const infrastructureSource = await readFile(
      path.join(commonLocationRoot, "infrastructure/common-location-api.ts"),
      "utf8",
    );

    expect(applicationSource).not.toContain("fetch(");
    expect(applicationSource).not.toContain("process.env");
    expect(infrastructureSource).toContain("fetch(");
  });

  it("keeps route-facing pages under interface/pages", async () => {
    const pageSource = await readFile(
      path.join(commonLocationRoot, "interface/pages/common-location-pages.tsx"),
      "utf8",
    );

    expect(pageSource).toContain("export function CommonLocationListPage");
    expect(pageSource).not.toMatch(/from ["']\.\.\/\.\.\/infrastructure\//);
  });
});
