import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryRoot = fileURLToPath(new URL("../..", import.meta.url));
const pageEntrypoints = [
  "apps/frontend/features/tenant/interface/pages/tenant-pages.tsx",
  "apps/frontend/features/company/interface/pages/company-pages.tsx",
  "apps/frontend/features/industry/interface/pages/industry-pages.tsx",
  "apps/frontend/features/common/interface/pages/common-pages.tsx",
] as const;

describe("frontend page entrypoint boundaries", () => {
  it("keeps public feature page entrypoints small enough for route imports", async () => {
    await Promise.all(
      pageEntrypoints.map(async (pageEntrypoint) => {
        const source = await readFile(path.join(repositoryRoot, pageEntrypoint), "utf8");

        expect(source.split(/\r?\n/).length, pageEntrypoint).toBeLessThan(700);
      }),
    );
  });

  it("keeps tenant, company, and industry public page exports stable", async () => {
    const expectedExports = {
      "apps/frontend/features/tenant/interface/pages/tenant-pages.tsx": [
        "TenantListPage",
        "TenantShowPage",
        "TenantUpsertPage",
      ],
      "apps/frontend/features/company/interface/pages/company-pages.tsx": [
        "CompanyListPage",
        "CompanyShowPage",
        "CompanyUpsertPage",
      ],
      "apps/frontend/features/industry/interface/pages/industry-pages.tsx": [
        "IndustryListPage",
        "IndustryShowPage",
        "IndustryUpsertPage",
      ],
    };

    await Promise.all(
      Object.entries(expectedExports).map(async ([pageEntrypoint, exports]) => {
        const source = await readFile(path.join(repositoryRoot, pageEntrypoint), "utf8");

        for (const exportedName of exports) {
          expect(source, pageEntrypoint).toContain(exportedName);
        }
      }),
    );
  });
});
