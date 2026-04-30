import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryRoot = fileURLToPath(new URL("../..", import.meta.url));
const industriesModuleRoot = path.join(repositoryRoot, "apps/server/src/modules/industries");

async function exists(relativePath: string): Promise<boolean> {
  try {
    await access(path.join(industriesModuleRoot, relativePath));
    return true;
  } catch {
    return false;
  }
}

describe("industries module boundaries", () => {
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
      path.join(industriesModuleRoot, "interface/http/industries.controller.ts"),
      "utf8",
    );

    expect(controllerSource).not.toContain("INDUSTRY_REPOSITORY");
    expect(controllerSource).toContain("CreateIndustryUseCase");
    expect(controllerSource).toContain("UpdateIndustryUseCase");
    expect(controllerSource).toContain("DeleteIndustryUseCase");
  });

  it("registers the module and GraphQL interface from the Nest module", async () => {
    const moduleSource = await readFile(
      path.join(industriesModuleRoot, "industries.module.ts"),
      "utf8",
    );

    expect(moduleSource).toContain("IndustriesRegistryBootstrap");
    expect(moduleSource).toContain("IndustriesResolver");
  });
});
