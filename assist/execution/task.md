# Task

Active reference: `#39`

## Active

- [ ] `#39` Add database refresh command
  - [x] Phase 1: inspect current runner and temp fresh implementation
  - [x] Phase 2: add guarded refresh/fresh drop-and-reinstall workflow
  - [ ] Phase 3: validate, sync version, and document

- [x] `#38` Add TypeScript database migration and seeder runner
  - [x] Phase 1: read temp migration and seeder process files
  - [x] Phase 2: implement typed migration, seeder, registry, and runner in `@cxnext/db`
  - [x] Phase 3: add tenant migration/seeder modules and package scripts
  - [x] Phase 4: add e2e coverage for migrate/seed idempotency
  - [x] Phase 5: validate, sync version, and document

- [x] `#37` Tighten master-list search card padding
  - [x] Phase 1: inspect reusable list toolbar spacing
  - [x] Phase 2: reduce master-list search card inner padding
  - [x] Phase 3: validate, sync version, and document

- [x] `#36` Brighten desk surface tone
  - [x] Phase 1: inspect current theme shell surface tokens
  - [x] Phase 2: reduce dark mixing in light desk surfaces
  - [x] Phase 3: validate, sync version, and document

- [x] `#34` Enforce strict tenant module structure for backend and frontend
  - [x] Phase 1: inspect architecture and current tenant wiring
    - [x] 1.1 read assist standards, rules, and module template
    - [x] 1.2 inspect backend and frontend tenant-related files
  - [x] Phase 2: add backend `tenants` bounded context structure
    - [x] 2.1 create `apps/server/src/modules/tenants` with DDD layer folders
    - [x] 2.2 add `database/migrations` and `database/seeder` under the tenant module
    - [x] 2.3 register the tenant module in the Nest application and module registry
  - [x] Phase 3: refactor frontend tenant feature into strict module folders
    - [x] 3.1 move tenant domain, application, infrastructure, and interface concerns into dedicated folders
    - [x] 3.2 update desk tenant routes to import from the new frontend module structure
  - [x] Phase 4: write strict repository rules for module structure
    - [x] 4.1 add or update assist rules and standards covering backend and frontend module layout
    - [x] 4.2 state that tenant-style module placement must be followed for future modules
  - [x] Phase 5: validate, sync version, and document
    - [x] 5.1 run frontend and server typecheck/lint
    - [x] 5.2 run UI typecheck/lint if affected
    - [x] 5.3 sync workspace version and changelog for `1.0.34`
