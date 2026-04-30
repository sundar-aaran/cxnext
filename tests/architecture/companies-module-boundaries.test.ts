import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryRoot = fileURLToPath(new URL("../..", import.meta.url));
const companiesModuleRoot = path.join(repositoryRoot, "apps/server/src/modules/companies");

async function exists(relativePath: string): Promise<boolean> {
  try {
    await access(path.join(companiesModuleRoot, relativePath));
    return true;
  } catch {
    return false;
  }
}

describe("companies module boundaries", () => {
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
      path.join(companiesModuleRoot, "interface/http/companies.controller.ts"),
      "utf8",
    );

    expect(controllerSource).not.toContain("COMPANY_REPOSITORY");
    expect(controllerSource).toContain("CreateCompanyUseCase");
    expect(controllerSource).toContain("UpdateCompanyUseCase");
    expect(controllerSource).toContain("DeleteCompanyUseCase");
  });

  it("registers the module and GraphQL interface from the Nest module", async () => {
    const moduleSource = await readFile(
      path.join(companiesModuleRoot, "companies.module.ts"),
      "utf8",
    );

    expect(moduleSource).toContain("CompaniesRegistryBootstrap");
    expect(moduleSource).toContain("CompaniesResolver");
  });

  it("keeps company persistence free of tenant and industry joins", async () => {
    const repositorySource = await readFile(
      path.join(companiesModuleRoot, "infrastructure/persistence/kysely-company.repository.ts"),
      "utf8",
    );

    expect(repositorySource).not.toContain('.innerJoin("tenants"');
    expect(repositorySource).not.toContain('.innerJoin("industries"');
  });
});
