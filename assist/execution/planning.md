# Planning

Active reference: `#47`

## Active

- `#47` Refactor industries module boundaries
  - Goal:
    - align the industries backend module with the repository's strict modular monolith and DDD layering rules.
  - Scope:
    - keep the batch focused on `apps/server/src/modules/industries`.
    - add module registry registration and missing strict module structure surfaces.
    - keep HTTP and GraphQL interface code thin by routing reads and writes through application use cases.
    - add focused tests that guard the industries boundary shape.
    - update release tracking to `1.0.47`.
  - Constraints:
    - do not mix in common-module cleanup, frontend folder cleanup, or oversized UI-file splitting.
    - do not introduce cross-module imports or cross-module database joins.
    - do not move unrelated migration runner behavior in `@cxnext/db`.
    - do not revert unrelated worktree changes.
  - Planned validation:
    - run server typecheck.
    - run targeted ESLint on changed industries files and focused tests.
    - run Vitest for the new industries boundary coverage and source-tree artifact guard.
  - Implemented:
    - added `IndustriesDefinition` and `IndustriesRegistryBootstrap` so the industries bounded context registers through the module registry.
    - added create, update, and delete industry use cases and moved HTTP write orchestration out of the controller.
    - added industries GraphQL read interface for list and get queries.
    - added module-local database migration and seeder export surfaces plus tracked strict-shape folders.
    - added focused architecture coverage for industries module shape and HTTP write boundaries.
    - added a matching `v-1.0.47` changelog entry and synchronized workspace versions to `1.0.47`.
  - Validation:
    - passed `C:\Users\sunda\AppData\Roaming\npm\pnpm.cmd --filter @cxnext/server typecheck`.
    - passed `C:\Users\sunda\AppData\Roaming\npm\pnpm.cmd exec eslint apps/server/src/modules/industries/industries.module.ts apps/server/src/modules/industries/industries.definition.ts apps/server/src/modules/industries/industries.registry.ts apps/server/src/modules/industries/application/use-cases/create-industry.use-case.ts apps/server/src/modules/industries/application/use-cases/update-industry.use-case.ts apps/server/src/modules/industries/application/use-cases/delete-industry.use-case.ts apps/server/src/modules/industries/interface/http/industries.controller.ts apps/server/src/modules/industries/interface/graphql/industries.resolver.ts apps/server/src/modules/industries/interface/graphql/industry.model.ts tests/architecture/industries-module-boundaries.test.ts --config eslint.config.mjs`.
    - passed `C:\Users\sunda\AppData\Roaming\npm\pnpm.cmd exec vitest run tests/architecture/industries-module-boundaries.test.ts tests/architecture/source-tree-artifacts.test.ts`.
  - Residual risk:
    - full repository lint was not run because previous batches identified unrelated common-module lint failures; this batch used targeted lint on the changed industries files and tests.
