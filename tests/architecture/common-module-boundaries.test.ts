import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryRoot = fileURLToPath(new URL("../..", import.meta.url));
const commonModuleRoot = path.join(repositoryRoot, "apps/server/src/modules/common");

async function exists(relativePath: string): Promise<boolean> {
  try {
    await access(path.join(commonModuleRoot, relativePath));
    return true;
  } catch {
    return false;
  }
}

describe("common module boundaries", () => {
  it("keeps the strict backend module shell", async () => {
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

  it("registers the common bounded context through its Nest module", async () => {
    const moduleSource = await readFile(path.join(commonModuleRoot, "common.module.ts"), "utf8");
    const registrySource = await readFile(
      path.join(commonModuleRoot, "common.registry.ts"),
      "utf8",
    );

    expect(moduleSource).toContain("CommonRegistryBootstrap");
    expect(registrySource).toContain("new CommonDefinition()");
  });

  it("keeps common-owned database setup visible from the module boundary", async () => {
    const migrationIndex = await readFile(
      path.join(commonModuleRoot, "database/migrations/index.ts"),
      "utf8",
    );
    const seederIndex = await readFile(
      path.join(commonModuleRoot, "database/seeder/index.ts"),
      "utf8",
    );

    expect(migrationIndex).toContain("createCommonLocationMigration");
    expect(migrationIndex).toContain("productCommonMigrations");
    expect(seederIndex).toContain("seedCommonLocationSeeder");
    expect(seederIndex).toContain("productCommonSeeders");
  });
});
