import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryRoot = fileURLToPath(new URL("../..", import.meta.url));
const commonModuleRoot = path.join(repositoryRoot, "apps/server/src/modules/common");
const locationModules = ["countries", "states", "districts", "cities", "pincodes"];

async function exists(relativePath: string): Promise<boolean> {
  try {
    await access(path.join(commonModuleRoot, relativePath));
    return true;
  } catch {
    return false;
  }
}

describe("common location boundaries", () => {
  it("keeps location behavior inside strict common DDD layers", async () => {
    const requiredPaths = [
      "domain/entities/common-location-record.ts",
      "domain/value-objects/common-location-definition.ts",
      "domain/events/common-location-record-created.event.ts",
      "application/services/common-location.repository.ts",
      "application/use-cases/location/create-common-location-record.use-case.ts",
      "infrastructure/persistence/kysely-common-location.repository.ts",
      "infrastructure/adapters/event-bus-domain-event-publisher.ts",
      "interface/http/common-location-controller.ts",
    ];

    await expect(
      Promise.all(requiredPaths.map((requiredPath) => exists(requiredPath))),
    ).resolves.toEqual(requiredPaths.map(() => true));
  });

  it("keeps location controllers free of direct repository access", async () => {
    for (const moduleName of locationModules) {
      const controllerSource = await readFile(
        path.join(commonModuleRoot, moduleName, `${moduleName}.controller.ts`),
        "utf8",
      );

      expect(controllerSource).not.toContain("CommonLocationRepository");
      expect(controllerSource).toContain("CreateCommonLocationRecordUseCase");
      expect(controllerSource).toContain("CommonLocationControllerBase");
    }
  });

  it("keeps location modules wired through infrastructure providers", async () => {
    for (const moduleName of locationModules) {
      const moduleSource = await readFile(
        path.join(commonModuleRoot, moduleName, `${moduleName}.module.ts`),
        "utf8",
      );

      expect(moduleSource).toContain("commonLocationProviders");
      expect(moduleSource).not.toContain("CommonLocationRepository");
    }
  });

  it("removes the old shared location repository path from the active module", async () => {
    await expect(exists("shared/common-location.repository.ts")).resolves.toBe(false);
    await expect(exists("shared/common-location-controller.ts")).resolves.toBe(false);
  });
});
