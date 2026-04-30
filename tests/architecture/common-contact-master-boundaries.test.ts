import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryRoot = fileURLToPath(new URL("../..", import.meta.url));
const commonModuleRoot = path.join(repositoryRoot, "apps/server/src/modules/common");
const contactMasterModules = ["contact-groups", "contact-types", "address-types", "bank-names"];

async function exists(relativePath: string): Promise<boolean> {
  try {
    await access(path.join(commonModuleRoot, relativePath));
    return true;
  } catch {
    return false;
  }
}

describe("common contact master boundaries", () => {
  it("keeps contact master behavior inside strict common DDD layers", async () => {
    const requiredPaths = [
      "domain/entities/common-master-record.ts",
      "domain/value-objects/common-master-definition.ts",
      "domain/events/common-master-record-created.event.ts",
      "domain/events/common-master-record-updated.event.ts",
      "domain/events/common-master-record-deleted.event.ts",
      "application/services/common-master.repository.ts",
      "application/use-cases/contact-masters/create-common-master-record.use-case.ts",
      "application/use-cases/contact-masters/update-common-master-record.use-case.ts",
      "application/use-cases/contact-masters/delete-common-master-record.use-case.ts",
      "infrastructure/persistence/kysely-common-master.repository.ts",
      "infrastructure/common-master.providers.ts",
      "infrastructure/adapters/event-bus-domain-event-publisher.ts",
      "interface/http/common-master-controller.ts",
    ];

    await expect(
      Promise.all(requiredPaths.map((requiredPath) => exists(requiredPath))),
    ).resolves.toEqual(requiredPaths.map(() => true));
  });

  it("keeps contact master controllers free of direct repository access", async () => {
    for (const moduleName of contactMasterModules) {
      const controllerSource = await readFile(
        path.join(commonModuleRoot, moduleName, `${moduleName}.controller.ts`),
        "utf8",
      );

      expect(controllerSource).not.toContain("Repository");
      expect(controllerSource).toContain("CreateCommonMasterRecordUseCase");
      expect(controllerSource).toContain("CommonMasterControllerBase");
    }
  });

  it("keeps contact master modules wired through infrastructure providers", async () => {
    for (const moduleName of contactMasterModules) {
      const moduleSource = await readFile(
        path.join(commonModuleRoot, moduleName, `${moduleName}.module.ts`),
        "utf8",
      );

      expect(moduleSource).toContain("commonMasterProviders");
      expect(moduleSource).not.toContain("Repository");
    }
  });

  it("removes old contact master repository files from child modules", async () => {
    for (const moduleName of contactMasterModules) {
      await expect(exists(`${moduleName}/${moduleName}.repository.ts`)).resolves.toBe(false);
    }
  });
});
