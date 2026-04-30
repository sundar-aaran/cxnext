# Planning

Active reference: `#48`

## Active

- `#48` Refactor common module boundary shell
  - Goal:
    - align the root common backend bounded context with the repository's strict modular monolith structure before peeling individual common master modules into use-case layers.
  - Scope:
    - keep this batch focused on `apps/server/src/modules/common`.
    - add common module registry registration.
    - add tracked strict root folders for domain, application, infrastructure, interface, and database surfaces.
    - add module-local database migration and seeder re-exports for common-owned database setup.
    - add focused architecture coverage for the common module shell.
    - update release tracking to `1.0.48`.
  - Constraints:
    - work directly on `main` as requested.
    - do not reorganize all common child masters in one batch.
    - do not mix in frontend feature structure or oversized UI-file splitting.
    - do not introduce cross-module imports or cross-module database joins.
  - Planned validation:
    - run server typecheck.
    - run targeted ESLint on changed common files and tests.
    - run Vitest for common boundary coverage, version sync, and source-tree artifact guard.
  - Implemented:
    - added `CommonDefinition` and `CommonRegistryBootstrap` so the common bounded context registers through the module registry.
    - added tracked strict root module folders for domain, application, infrastructure, interface, and database ownership.
    - added module-local migration and seeder export surfaces for common-owned database setup.
    - added focused architecture coverage for the common module shell and database boundary exports.
    - added a matching `v-1.0.48` changelog entry and synchronized workspace versions to `1.0.48`.
  - Validation:
    - passed `C:\Users\sunda\AppData\Roaming\npm\pnpm.cmd --filter @cxnext/server typecheck`.
    - passed `C:\Users\sunda\AppData\Roaming\npm\pnpm.cmd exec eslint apps/server/src/modules/common/common.module.ts apps/server/src/modules/common/common.definition.ts apps/server/src/modules/common/common.registry.ts apps/server/src/modules/common/database/migrations/index.ts apps/server/src/modules/common/database/migrations/001-create-common-location.ts apps/server/src/modules/common/database/migrations/common-master-migrations.ts apps/server/src/modules/common/database/seeder/index.ts apps/server/src/modules/common/database/seeder/001-seed-common-location.ts apps/server/src/modules/common/database/seeder/common-master-seeders.ts tests/architecture/common-module-boundaries.test.ts --config eslint.config.mjs`.
    - passed `C:\Users\sunda\AppData\Roaming\npm\pnpm.cmd exec vitest run tests/architecture/common-module-boundaries.test.ts tests/architecture/source-tree-artifacts.test.ts`.
    - passed `C:\Users\sunda\AppData\Roaming\npm\pnpm.cmd exec vitest run tests/architecture/common-module-boundaries.test.ts tests/architecture/version-sync.test.ts tests/architecture/source-tree-artifacts.test.ts`.
  - Residual risk:
    - common child master controllers still directly call their repositories; this batch intentionally fixed the common bounded-context shell first so child masters can be moved into use-case layers in smaller follow-up batches.
