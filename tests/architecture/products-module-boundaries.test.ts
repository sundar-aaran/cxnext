import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryRoot = fileURLToPath(new URL("../..", import.meta.url));
const productsModuleRoot = path.join(repositoryRoot, "apps/server/src/modules/products");

async function exists(relativePath: string): Promise<boolean> {
  try {
    await access(path.join(productsModuleRoot, relativePath));
    return true;
  } catch {
    return false;
  }
}

describe("products module boundaries", () => {
  it("keeps the strict backend module shape", async () => {
    const requiredPaths = [
      "domain/entities",
      "domain/value-objects",
      "domain/aggregates",
      "domain/events",
      "application/use-cases",
      "application/services",
      "infrastructure/persistence",
      "infrastructure/adapters",
      "interface/graphql",
      "interface/http",
      "database/migrations",
      "database/seeder",
    ];

    await expect(
      Promise.all(requiredPaths.map((requiredPath) => exists(requiredPath))),
    ).resolves.toEqual(requiredPaths.map(() => true));
  });

  it("keeps HTTP writes behind application use cases", async () => {
    const controllerSource = await readFile(
      path.join(productsModuleRoot, "interface/http/products.controller.ts"),
      "utf8",
    );

    expect(controllerSource).not.toContain("PRODUCT_REPOSITORY");
    expect(controllerSource).toContain("CreateProductUseCase");
    expect(controllerSource).toContain("UpdateProductUseCase");
    expect(controllerSource).toContain("DeleteProductUseCase");
  });

  it("keeps product persistence free of common master joins", async () => {
    const repositorySource = await readFile(
      path.join(productsModuleRoot, "infrastructure/persistence/kysely-product.repository.ts"),
      "utf8",
    );

    expect(repositorySource).not.toContain('.innerJoin("common_');
    expect(repositorySource).not.toContain('.leftJoin("common_');
  });
});
