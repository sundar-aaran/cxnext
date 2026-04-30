import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

describe("company module boundaries", () => {
  it("does not join tenant or industry tables from company persistence", async () => {
    const repositoryPath = path.join(
      fileURLToPath(new URL("../../..", import.meta.url)),
      "apps/server/src/modules/companies/infrastructure/persistence/kysely-company.repository.ts",
    );
    const source = await readFile(repositoryPath, "utf8");

    expect(source).not.toMatch(/innerJoin\(["']tenants["']/);
    expect(source).not.toMatch(/innerJoin\(["']industries["']/);
  });
});
