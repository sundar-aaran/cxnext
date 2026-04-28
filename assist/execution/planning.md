# Planning

Active reference: `#34`

## Active

- `#34` Enforce strict tenant module structure for backend and frontend
  - Goal:
    - make Tenant a first-class bounded context with an explicit modular monolith and DDD folder layout on both backend and frontend.
    - codify strict repository rules so future modules follow the same structure without drift.
  - Scope:
    - add `apps/server/src/modules/tenants` with domain, application, infrastructure, interface, and database folders.
    - include `database/migrations` and `database/seeder` inside the backend tenant module.
    - register the backend tenant module with Nest and the module registry.
    - refactor the frontend tenant feature into explicit module folders under `apps/frontend/features/tenant`.
    - update assist standards/rules to make this structure mandatory.
    - synchronize workspace versions and changelog after validation.
  - Constraints:
    - preserve the current tenant UI routes and current local data behavior in this batch.
    - keep backend domain code framework-free and keep transport code thin.
    - do not revert unrelated dirty worktree changes.
  - Planned validation:
    - run `corepack pnpm --filter @cxnext/server typecheck`.
    - run `corepack pnpm --filter @cxnext/server lint`.
    - run `corepack pnpm --filter @cxnext/frontend typecheck`.
    - run `corepack pnpm --filter @cxnext/frontend lint`.
    - run `corepack pnpm --filter @cxnext/ui typecheck` and lint if UI exports or imports are touched.
    - run targeted Prettier checks for edited files.
  - Implemented:
    - added a real backend bounded context at `apps/server/src/modules/tenants` with `domain`, `application`, `infrastructure`, `interface`, and `database` folders.
    - added `database/migrations` and `database/seeder` inside the backend tenant module.
    - added backend tenant aggregate, value object, repository port, use cases, HTTP controller, GraphQL resolver, module definition, and registry bootstrap.
    - registered the tenant backend module in Nest through `TenantsModule` and in the module registry through `TenantsRegistryBootstrap`.
    - refactored frontend tenant code into `features/tenant/domain`, `application`, `infrastructure`, and `interface/pages`.
    - updated desk tenant routes to import page components from the strict frontend interface layer.
    - added `assist/rules/strict-module-structure.md` and updated standards/readme references to make the pattern mandatory.
    - synchronized workspace package versions to `1.0.34`.
  - Validation:
    - passed `corepack pnpm --filter @cxnext/server typecheck`.
    - passed `corepack pnpm --filter @cxnext/server lint`.
    - passed `corepack pnpm --filter @cxnext/frontend typecheck`.
    - passed `corepack pnpm --filter @cxnext/frontend lint`.
    - passed `corepack pnpm --filter @cxnext/ui typecheck`.
    - passed `corepack pnpm --filter @cxnext/ui lint`.
    - passed targeted Prettier write/check for edited backend, frontend, and assist files.
    - verified `http://localhost:3000/desk/tenant` returns `200` after the frontend module refactor.
  - Residual risk:
    - backend tenant persistence is still backed by an in-memory repository in this batch; the module structure, migration, and seeder are now in place for a later real database adapter.
