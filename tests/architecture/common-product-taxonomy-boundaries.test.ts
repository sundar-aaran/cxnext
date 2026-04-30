import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryRoot = fileURLToPath(new URL("../..", import.meta.url));
const commonModuleRoot = path.join(repositoryRoot, "apps/server/src/modules/common");
const productTaxonomyModules = ["product-groups", "product-categories", "product-types"];

async function exists(relativePath: string): Promise<boolean> {
  try {
    await access(path.join(commonModuleRoot, relativePath));
    return true;
  } catch {
    return false;
  }
}

describe("common product taxonomy boundaries", () => {
  it("keeps product taxonomy controllers free of direct repository access", async () => {
    for (const moduleName of productTaxonomyModules) {
      const controllerSource = await readFile(
        path.join(commonModuleRoot, moduleName, `${moduleName}.controller.ts`),
        "utf8",
      );

      expect(controllerSource).not.toContain("Repository");
      expect(controllerSource).toContain("CreateCommonMasterRecordUseCase");
      expect(controllerSource).toContain("CommonMasterControllerBase");
    }
  });

  it("keeps product taxonomy modules wired through infrastructure providers", async () => {
    for (const moduleName of productTaxonomyModules) {
      const moduleSource = await readFile(
        path.join(commonModuleRoot, moduleName, `${moduleName}.module.ts`),
        "utf8",
      );

      expect(moduleSource).toContain("commonMasterProviders");
      expect(moduleSource).not.toContain("Repository");
    }
  });

  it("removes old product taxonomy repository files from child modules", async () => {
    for (const moduleName of productTaxonomyModules) {
      await expect(exists(`${moduleName}/${moduleName}.repository.ts`)).resolves.toBe(false);
    }
  });

  it("keeps product category fields in the common master definition", async () => {
    const definitionSource = await readFile(
      path.join(commonModuleRoot, "domain/value-objects/common-master-definition.ts"),
      "utf8",
    );

    expect(definitionSource).toContain("productCategories");
    expect(definitionSource).toContain("positionOrder");
    expect(definitionSource).toContain("showOnStorefrontTopMenu");
    expect(definitionSource).toContain("showOnStorefrontCatalog");
  });
});
