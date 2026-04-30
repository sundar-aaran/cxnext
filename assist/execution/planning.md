# Planning

Active reference: `#50`

## Active

- `#50` Refactor common location boundaries
  - Goal:
    - align `countries`, `states`, `districts`, `cities`, and `pincodes` under common with scalable modular monolith, DDD, and event-driven boundaries.
  - Scope:
    - keep this batch focused on the common location group.
    - place location definitions, records, and events under the common domain layer.
    - place repository ports and location use cases under the common application layer.
    - place Kysely persistence and event-bus publication under the common infrastructure layer.
    - keep HTTP controllers thin by routing all location reads and writes through application use cases.
    - add focused tests for boundary shape and write-event publication.
    - update release tracking to `1.0.50`.
  - Constraints:
    - work directly on `main` as requested.
    - do not refactor unrelated common master modules.
    - do not change database schema or seed ordering in this boundary batch.
    - do not introduce cross-module imports or cross-module database joins.
  - Planned validation:
    - run server typecheck.
    - run targeted ESLint on changed common location files and tests.
    - run Vitest for common location boundary/event coverage, version sync, and source-tree artifact guard.
  - Implemented:
    - moved common location definitions and records into domain value-object/entity files.
    - added common location created, updated, and deleted domain events.
    - added common location repository and domain-event publisher application ports.
    - added list, get, create, update, and delete common location application use cases.
    - moved Kysely location persistence into `infrastructure/persistence` behind the repository port.
    - added an event-bus domain-event publisher adapter for common location writes.
    - rewired countries, states, districts, cities, and pincodes controllers to call application use cases through a shared HTTP base.
    - rewired the five location modules through common location infrastructure providers.
    - removed the old shared location repository/controller files.
    - added focused boundary and event publication tests.
    - added a matching `v-1.0.50` changelog entry and synchronized workspace versions to `1.0.50`.
  - Validation:
    - passed `C:\Users\sunda\AppData\Roaming\npm\pnpm.cmd --filter @cxnext/server typecheck`.
    - passed targeted ESLint for changed common location domain, application, infrastructure, interface, and test files.
    - passed `C:\Users\sunda\AppData\Roaming\npm\pnpm.cmd exec vitest run tests/architecture/common-location-boundaries.test.ts tests/server/common/location-use-cases.test.ts tests/architecture/source-tree-artifacts.test.ts`.
    - passed `C:\Users\sunda\AppData\Roaming\npm\pnpm.cmd exec vitest run tests/architecture/common-location-boundaries.test.ts tests/server/common/location-use-cases.test.ts tests/architecture/version-sync.test.ts tests/architecture/source-tree-artifacts.test.ts`.
  - Residual risk:
    - remaining common master groups still use their current controller/repository shape and should be moved in smaller follow-up batches.
