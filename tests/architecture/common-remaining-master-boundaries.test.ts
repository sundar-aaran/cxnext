import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryRoot = fileURLToPath(new URL("../..", import.meta.url));
const commonModuleRoot = path.join(repositoryRoot, "apps/server/src/modules/common");
const remainingMasterModules = [
  "hsn-codes",
  "taxes",
  "warehouses",
  "transports",
  "destinations",
  "order-types",
  "stock-rejection-types",
  "currencies",
  "payment-terms",
];

async function exists(relativePath: string): Promise<boolean> {
  try {
    await access(path.join(commonModuleRoot, relativePath));
    return true;
  } catch {
    return false;
  }
}

describe("remaining common master boundaries", () => {
  it("keeps remaining common master controllers free of direct repository access", async () => {
    for (const moduleName of remainingMasterModules) {
      const controllerSource = await readFile(
        path.join(commonModuleRoot, moduleName, `${moduleName}.controller.ts`),
        "utf8",
      );

      expect(controllerSource).not.toContain("Repository");
      expect(controllerSource).toContain("CreateCommonMasterRecordUseCase");
      expect(controllerSource).toContain("CommonMasterControllerBase");
    }
  });

  it("keeps remaining common master modules wired through infrastructure providers", async () => {
    for (const moduleName of remainingMasterModules) {
      const moduleSource = await readFile(
        path.join(commonModuleRoot, moduleName, `${moduleName}.module.ts`),
        "utf8",
      );

      expect(moduleSource).toContain("commonMasterProviders");
      expect(moduleSource).not.toContain("Repository");
    }
  });

  it("removes old remaining common master repository files from child modules", async () => {
    for (const moduleName of remainingMasterModules) {
      await expect(exists(`${moduleName}/${moduleName}.repository.ts`)).resolves.toBe(false);
    }
  });

  it("keeps specialized common master fields in the shared definition", async () => {
    const definitionSource = await readFile(
      path.join(commonModuleRoot, "domain/value-objects/common-master-definition.ts"),
      "utf8",
    );

    expect(definitionSource).toContain("taxType");
    expect(definitionSource).toContain("ratePercent");
    expect(definitionSource).toContain("isDefaultLocation");
    expect(definitionSource).toContain("decimalPlaces");
    expect(definitionSource).toContain("dueDays");
  });
});
