import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryRoot = fileURLToPath(new URL("../..", import.meta.url));
const featuresRoot = path.join(repositoryRoot, "apps/frontend/features");
const strictFeatureKeys = ["common", "company", "industry"] as const;

async function exists(relativePath: string): Promise<boolean> {
  try {
    await access(path.join(featuresRoot, relativePath));
    return true;
  } catch {
    return false;
  }
}

describe("frontend feature module shells", () => {
  it("keeps common, company, and industry in strict frontend feature folders", async () => {
    const requiredPaths = strictFeatureKeys.flatMap((featureKey) => [
      `${featureKey}/domain`,
      `${featureKey}/application`,
      `${featureKey}/infrastructure`,
      `${featureKey}/interface/pages`,
    ]);

    await expect(
      Promise.all(requiredPaths.map((requiredPath) => exists(requiredPath))),
    ).resolves.toEqual(requiredPaths.map(() => true));
  });

  it("keeps feature API adapters out of application services", async () => {
    const applicationFiles = [
      "common/application/common-service.ts",
      "company/application/company-service.ts",
      "industry/application/industry-service.ts",
    ];

    await Promise.all(
      applicationFiles.map(async (applicationFile) => {
        const source = await readFile(path.join(featuresRoot, applicationFile), "utf8");

        expect(source, applicationFile).not.toContain("fetch(");
        expect(source, applicationFile).not.toContain("process.env");
        expect(source, applicationFile).not.toContain("window.");
      }),
    );
  });

  it("places HTTP adapter code in feature infrastructure folders", async () => {
    const infrastructureFiles = [
      "common/infrastructure/common-api.ts",
      "company/infrastructure/company-api.ts",
      "industry/infrastructure/industry-api.ts",
    ];

    await Promise.all(
      infrastructureFiles.map(async (infrastructureFile) => {
        const source = await readFile(path.join(featuresRoot, infrastructureFile), "utf8");

        expect(source, infrastructureFile).toContain("fetch(");
      }),
    );
  });
});
