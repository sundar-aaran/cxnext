# Planning

Active reference: `#51`

## Active

- `#51` Plan remaining modular boundary refactors
  - Goal:
    - clear old completed execution notes and create one complete forward-looking roadmap for finishing scalable modular monolith, DDD, event-driven, and frontend bounded-context cleanup.
  - Scope:
    - review current backend module structure, remaining direct repository access, frontend feature shape, route imports, and oversized files.
    - update `assist/execution/task.md` with the upcoming module-by-module task backlog.
    - update this planning file with sequencing, implementation boundaries, validation approach, and residual risks.
    - update release tracking to `1.0.51` for this planning batch.
  - Constraints:
    - this is a planning-only batch; do not refactor implementation code here.
    - future implementation batches should remain PR-sized even when a group contains multiple similar child modules.
    - do not mix backend common-master refactors with frontend folder/file-size refactors.
    - preserve current HTTP route contracts and user-facing behavior during each migration.
  - Planned validation:
    - inspect backend and frontend trees with targeted static checks.
    - run version sync after updating release metadata.
    - run architecture tests for version sync and source-tree artifact guard.
  - Implemented:
    - reviewed backend module trees, remaining common child master direct repository access, frontend feature folder shape, route imports, and oversized files.
    - cleared completed execution notes from `assist/execution/task.md` and `assist/execution/planning.md`.
    - wrote the full upcoming task backlog from `#52` through `#64`.
    - wrote the module-by-module roadmap with goals, implementation notes, and validation expectations.
    - added a matching `v-1.0.51` changelog entry and synchronized workspace versions to `1.0.51`.
  - Validation:
    - passed `node scripts/version-sync.mjs --ref 51`.
    - passed `git diff --check`.
    - passed `C:\Users\sunda\AppData\Roaming\npm\pnpm.cmd exec vitest run tests/architecture/version-sync.test.ts tests/architecture/source-tree-artifacts.test.ts`.
  - Residual risk:
    - roadmap sequencing may change if a future implementation batch exposes hidden coupling, but each listed slice is scoped to preserve current behavior and route contracts.

## Roadmap

- `#52` Common contact masters:
  - Goal:
    - move `contact-groups`, `contact-types`, `address-types`, and `bank-names` out of controller/repository CRUD and into common master domain/application/infrastructure/interface layering.
  - Implementation notes:
    - introduce a reusable common master repository port, use cases, event publisher, and Kysely adapter if the existing table shapes can share one abstraction.
    - keep module controllers as thin wrappers that only provide the module key and route decorators.
  - Validation:
    - targeted server typecheck, targeted ESLint, contact-master boundary tests, and write-event tests.

- `#53` Common product taxonomy masters:
  - Goal:
    - refactor `product-groups`, `product-categories`, and `product-types` into DDD/application boundaries.
  - Implementation notes:
    - preserve parent/foreign-key mapping behavior and add display-name safety checks where applicable.
    - avoid coupling product taxonomy code to future inventory/catalog domains.
  - Validation:
    - targeted typecheck/lint, taxonomy persistence tests, controller boundary tests.

- `#54` Common product attribute masters:
  - Goal:
    - refactor `brands`, `colours`, `sizes`, `styles`, and `units`.
  - Implementation notes:
    - reuse common master use cases where the tables share behavior.
    - add small value-object helpers only where fields have meaningful behavior, such as colour code or unit code normalization.
  - Validation:
    - targeted typecheck/lint, write-event tests, route smoke coverage where available.

- `#55` Common compliance masters:
  - Goal:
    - refactor `hsn-codes` and `taxes` without hiding tax-specific fields inside overly generic code.
  - Implementation notes:
    - use a specialized mapper for tax fields and defaults.
    - guard database refresh behavior because tax seed issues previously blocked `db:fresh`.
  - Validation:
    - targeted typecheck/lint, tax/HSN persistence mapping tests, optional `db:fresh` when database access is available.

- `#56` Common order and logistics masters:
  - Goal:
    - refactor `warehouses`, `transports`, `destinations`, `order-types`, and `stock-rejection-types`.
  - Implementation notes:
    - keep the work as one logistics/order-common slice because current controllers share the same CRUD shape.
    - avoid introducing order-domain behavior beyond the current common master records.
  - Validation:
    - targeted typecheck/lint, boundary tests, write-event tests.

- `#57` Common finance and terms masters:
  - Goal:
    - refactor `currencies` and `payment-terms`.
  - Implementation notes:
    - keep currency and payment-term behavior domain-neutral under common.
    - add tests for status/delete behavior and currency field mapping.
  - Validation:
    - targeted typecheck/lint, focused persistence/use-case tests.

- `#58` Backend domain hardening:
  - Goal:
    - replace placeholder DDD folders with useful domain code and strengthen event publication across backend write flows.
  - Implementation notes:
    - start with `industries` and `companies` because they currently have record types but little real domain model.
    - add update/delete events where they represent meaningful domain facts.
    - keep shared event publisher abstractions local unless a truly generic package-level abstraction is justified.
  - Validation:
    - domain import-restriction tests, event publication tests, server typecheck.

- `#59` Frontend feature module shells:
  - Goal:
    - make `common`, `company`, and `industry` frontend features match `domain/application/infrastructure/interface/pages`.
  - Implementation notes:
    - move fetch/storage/browser adapter code into `infrastructure`.
    - keep route imports stable from `interface/pages`.
  - Validation:
    - frontend typecheck, targeted lint, frontend structure tests.

- `#60` Frontend common/location pages:
  - Goal:
    - split common list and location page composition into smaller bounded-context files.
  - Implementation notes:
    - keep common-list UI behavior stable.
    - avoid touching unrelated desk navigation unless required by imports.
  - Validation:
    - frontend typecheck, page import boundary tests, optional browser smoke test.

- `#61` Frontend desk and cxsun modules:
  - Goal:
    - move flat `desk` and `cxsun` features into strict frontend bounded-context layout.
  - Implementation notes:
    - preserve `desk-registry` public contract during moves.
    - keep route behavior stable for portal and record pages.
  - Validation:
    - frontend typecheck, route import tests, optional browser smoke test.

- `#62` Dashboard shell split:
  - Goal:
    - reduce `packages/ui/src/blocks/dashboard/dashboard-shell.tsx` below the file-size threshold.
  - Implementation notes:
    - split by cohesive UI responsibility: shell frame, sidebar/nav, header, content area, responsive helpers.
    - keep package exports stable.
  - Validation:
    - package/frontend typecheck, targeted lint, file-size architecture test.

- `#63` Frontend page file split:
  - Goal:
    - reduce oversized `tenant-pages.tsx`, `company-pages.tsx`, `industry-pages.tsx`, and `common-pages.tsx`.
  - Implementation notes:
    - split into list/show/upsert/form/helpers while preserving public page exports.
    - avoid behavior changes unless tests reveal defects.
  - Validation:
    - frontend typecheck, file-size architecture test, route import boundary test.

- `#64` Final boundary enforcement:
  - Goal:
    - add permanent architecture coverage so future work cannot regress backend/frontend boundaries.
  - Implementation notes:
    - cover strict backend folders, strict frontend folders, controller-to-repository access, cross-module infrastructure imports, domain framework imports, generated source artifacts, version sync, and file-size limits.
    - keep tests readable and cheap enough for regular local runs.
  - Validation:
    - full architecture test suite, server typecheck, frontend typecheck, targeted lint.
