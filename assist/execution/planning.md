# Planning

Active reference: `#46`

## Active

- `#46` Refactor company module read boundaries
  - Goal:
    - remove the company repository's direct cross-module joins to tenant and industry tables while preserving the current company API response shape.
  - Scope:
    - add company application-layer lookup ports for tenant and industry display names.
    - add infrastructure adapters that read display names through generic database access without importing tenant or industry module internals.
    - update `KyselyCompanyRepository` so its base company query touches only company-owned tables.
    - register lookup adapters in `CompaniesModule`.
    - validate and prepare an independent branch/PR.
  - Constraints:
    - fix one module slice only; do not refactor tenant/common/industry strict shapes in this batch.
    - preserve current `CompanyRecord` fields and HTTP response shape.
    - do not import another module's domain/application/infrastructure internals.
    - do not revert unrelated work.
  - Planned validation:
    - run `@cxnext/server` typecheck.
    - run targeted ESLint for changed company files.
    - run architecture/source artifact tests if source tree changes.
    - sync version/changelog for `#46`.
  - Implemented:
    - created branch `codex/refactor-company-boundaries` from `main`.
    - added company application ports for tenant and industry display-name lookup.
    - added Kysely lookup adapters for tenant and industry display names without importing tenant or industry module internals.
    - removed direct `tenants` and `industries` joins from `KyselyCompanyRepository`.
    - preserved `tenantName` and `industryName` in `CompanyRecord`/HTTP responses by resolving names through lookup ports.
    - registered lookup adapters in `CompaniesModule`.
    - added a boundary regression test preventing company persistence from joining tenant or industry tables.
    - added changelog entry `v-1.0.46` and synchronized workspace package versions to `1.0.46`.
  - Validation:
    - passed `C:\Users\sunda\AppData\Roaming\npm\pnpm.cmd --filter @cxnext/server typecheck`.
    - passed targeted ESLint for changed company files and the new company boundary test.
    - passed `C:\Users\sunda\AppData\Roaming\npm\pnpm.cmd exec vitest run tests/server/companies/company-boundary.test.ts tests/architecture/source-tree-artifacts.test.ts`.
    - passed `node scripts/version-sync.mjs --ref 46`.
  - Residual risk:
    - the lookup adapters still read tenant and industry database tables because those modules do not yet expose formal public read contracts; this is isolated behind company-owned application ports and is the next-best boundary until tenant/industry contracts are introduced.
    - full `@cxnext/server lint` remains blocked by existing common-module lint errors outside this company slice.
