# Planning

Active reference: `#49`

## Active

- `#49` Refactor companies module boundaries
  - Goal:
    - align the companies backend module with the repository's strict modular monolith and DDD layering rules.
  - Scope:
    - keep this batch focused on `apps/server/src/modules/companies`.
    - add companies module registry registration and missing strict module structure surfaces.
    - keep HTTP and GraphQL interface code thin by routing reads and writes through application use cases.
    - add module-local database migration and seeder re-exports for company-owned database setup.
    - add focused tests that guard companies boundary shape and HTTP write layering.
    - update release tracking to `1.0.49`.
  - Constraints:
    - work directly on `main` as requested.
    - do not mix in common child-master cleanup, frontend feature structure, or oversized UI-file splitting.
    - do not reintroduce tenant or industry joins in company persistence.
    - do not revert unrelated worktree changes.
  - Planned validation:
    - run server typecheck.
    - run targeted ESLint on changed companies files and tests.
    - run Vitest for companies boundary coverage, version sync, and source-tree artifact guard.
  - Implemented:
    - added `CompaniesDefinition` and `CompaniesRegistryBootstrap` so the companies bounded context registers through the module registry.
    - added create, update, and delete company use cases and moved HTTP write orchestration out of the controller.
    - added companies GraphQL read interface for list and get queries.
    - added module-local database migration and seeder export surfaces plus tracked strict-shape folders.
    - added focused architecture coverage for companies module shape, HTTP write boundaries, and the existing no-join persistence rule.
    - added a matching `v-1.0.49` changelog entry and synchronized workspace versions to `1.0.49`.
  - Validation:
    - passed `C:\Users\sunda\AppData\Roaming\npm\pnpm.cmd --filter @cxnext/server typecheck`.
    - passed `C:\Users\sunda\AppData\Roaming\npm\pnpm.cmd exec eslint apps/server/src/modules/companies/companies.module.ts apps/server/src/modules/companies/companies.definition.ts apps/server/src/modules/companies/companies.registry.ts apps/server/src/modules/companies/application/use-cases/create-company.use-case.ts apps/server/src/modules/companies/application/use-cases/update-company.use-case.ts apps/server/src/modules/companies/application/use-cases/delete-company.use-case.ts apps/server/src/modules/companies/interface/http/companies.controller.ts apps/server/src/modules/companies/interface/graphql/companies.resolver.ts apps/server/src/modules/companies/interface/graphql/company.model.ts tests/architecture/companies-module-boundaries.test.ts --config eslint.config.mjs`.
    - passed `C:\Users\sunda\AppData\Roaming\npm\pnpm.cmd exec vitest run tests/architecture/companies-module-boundaries.test.ts tests/server/companies/company-boundary.test.ts tests/architecture/source-tree-artifacts.test.ts`.
    - passed `C:\Users\sunda\AppData\Roaming\npm\pnpm.cmd exec vitest run tests/architecture/companies-module-boundaries.test.ts tests/server/companies/company-boundary.test.ts tests/architecture/version-sync.test.ts tests/architecture/source-tree-artifacts.test.ts`.
  - Residual risk:
    - none identified for this companies boundary slice.
