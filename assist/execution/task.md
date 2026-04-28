# Task

Active reference: `#34`

## Active

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
