import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryRoot = fileURLToPath(new URL("../..", import.meta.url));

const backendEntryFiles = [
  "apps/server/src/modules/entries/entries.module.ts",
  "apps/server/src/modules/entries/domain/aggregates/entry.aggregate.ts",
  "apps/server/src/modules/entries/application/services/entries.repository.ts",
  "apps/server/src/modules/entries/infrastructure/persistence/kysely-entries.repository.ts",
  "apps/server/src/modules/entries/interface/http/entries.controller.ts",
] as const;

const frontendEntryFeatures = ["sales", "purchase", "payment", "receipt"] as const;

describe("entries module boundaries", () => {
  it("keeps billing table names and allocation tables explicit", async () => {
    const migration = await readFile(
      path.join(repositoryRoot, "packages/db/src/migrations/007-create-entries.ts"),
      "utf8",
    );

    expect(migration).toContain('"sales"');
    expect(migration).toContain('"sales_items"');
    expect(migration).toContain('"purchases"');
    expect(migration).toContain('"purchase_items"');
    expect(migration).toContain('"payment_allocations"');
    expect(migration).toContain('"receipt_allocations"');
  });

  it("keeps backend entries in modular monolith layers", async () => {
    await Promise.all(
      backendEntryFiles.map(async (filePath) => {
        const source = await readFile(path.join(repositoryRoot, filePath), "utf8");
        expect(source.length, filePath).toBeGreaterThan(0);
      }),
    );
  });

  it("keeps frontend entry features individually modular", async () => {
    await Promise.all(
      frontendEntryFeatures.flatMap((feature) =>
        ["domain", "application", "infrastructure", "interface"].map(async (layer) => {
          const layerExists = await access(
            path.join(repositoryRoot, `apps/frontend/features/${feature}/${layer}`),
          ).then(
            () => true,
            () => false,
          );
          expect(layerExists, `${feature}/${layer}`).toBe(true);
        }),
      ),
    );
  });
});
