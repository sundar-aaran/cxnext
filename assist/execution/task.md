# Task

Active reference: `#51`

## Next Agent Handoff

Start here before doing any new implementation:

1. Read `assist/Readme.md`, `assist/agent.md`, `assist/rules/execution-tracking.md`, `assist/rules/strict-module-structure.md`, `assist/rules/module-boundaries.md`, `assist/rules/import-restrictions.md`, `assist/rules/versioning-and-releases.md`, `assist/standards/ddd.md`, `assist/standards/event-driven.md`, and `assist/standards/modular-monolith.md`.
2. Keep working directly on `main` unless the user asks for a branch.
3. Pick the first unchecked item under `## Upcoming`.
4. Before implementation, replace `## Active` in this file and `assist/execution/planning.md` with only that selected task. Keep future unchecked items under `## Upcoming`.
5. Use reference/version alignment:
   - `#52` means package version `1.0.52`.
   - changelog section `## v-1.0.52`.
   - changelog entry `### [v 1.0.52] YYYY-MM-DD - Title`.
   - commit subject starts with `#52`.
6. Do not copy completed task details forward. Completed history belongs in `assist/documentation/CHANGELOG.md`.

Command flow for the next implementation batch:

```powershell
git status --short
Get-Content assist/Readme.md
Get-Content assist/agent.md
Get-Content assist/rules/execution-tracking.md
Get-Content assist/rules/strict-module-structure.md
Get-Content assist/rules/module-boundaries.md
Get-Content assist/rules/import-restrictions.md
Get-Content assist/rules/versioning-and-releases.md
Get-Content assist/standards/ddd.md
Get-Content assist/standards/event-driven.md
Get-Content assist/standards/modular-monolith.md
```

After implementation and release metadata:

```powershell
node scripts/version-sync.mjs --ref <reference>
C:\Users\sunda\AppData\Roaming\npm\pnpm.cmd --filter @cxnext/server typecheck
C:\Users\sunda\AppData\Roaming\npm\pnpm.cmd exec vitest run <focused-tests> tests/architecture/version-sync.test.ts tests/architecture/source-tree-artifacts.test.ts
git diff --check
git add <changed-files>
git commit -m "#<reference> <type>(<scope>): <summary>"
git push origin main
```

Backend common master target shape:

```text
apps/server/src/modules/common/
  domain/
    entities/
      common-master-record.ts
      common-location-record.ts
    value-objects/
      common-master-definition.ts
      common-location-definition.ts
    events/
      common-master-record-created.event.ts
      common-master-record-updated.event.ts
      common-master-record-deleted.event.ts
  application/
    services/
      common-master.repository.ts
      common-location.repository.ts
      domain-event-publisher.ts
    use-cases/
      <group-name>/
        list-<group-name>-records.use-case.ts
        get-<group-name>-record.use-case.ts
        create-<group-name>-record.use-case.ts
        update-<group-name>-record.use-case.ts
        delete-<group-name>-record.use-case.ts
  infrastructure/
    persistence/
      kysely-<group-name>.repository.ts
    adapters/
      event-bus-domain-event-publisher.ts
    <group-name>.providers.ts
  interface/
    http/
      <group-name>-controller.ts
```

Concrete examples:

```text
apps/server/src/modules/common/application/use-cases/contact-masters/list-contact-master-records.use-case.ts
apps/server/src/modules/common/infrastructure/persistence/kysely-contact-master.repository.ts
apps/server/src/modules/common/interface/http/contact-master-controller.ts
tests/architecture/common-contact-master-boundaries.test.ts
tests/server/common/contact-master-use-cases.test.ts
```

Per-module controller rule:

```ts
// apps/server/src/modules/common/contact-groups/contact-groups.controller.ts
@Controller("common/contact-groups")
export class ContactGroupsController extends ContactMasterControllerBase {
  public constructor(
    @Inject(ListContactMasterRecordsUseCase)
    listUseCase: ListContactMasterRecordsUseCase,
    @Inject(GetContactMasterRecordUseCase)
    getUseCase: GetContactMasterRecordUseCase,
    @Inject(CreateContactMasterRecordUseCase)
    createUseCase: CreateContactMasterRecordUseCase,
    @Inject(UpdateContactMasterRecordUseCase)
    updateUseCase: UpdateContactMasterRecordUseCase,
    @Inject(DeleteContactMasterRecordUseCase)
    deleteUseCase: DeleteContactMasterRecordUseCase,
  ) {
    super("contactGroups", listUseCase, getUseCase, createUseCase, updateUseCase, deleteUseCase);
  }
}
```

Repository and event rules for every upcoming backend slice:

- Controllers must not inject repositories directly.
- Controllers call application use cases only.
- Application use cases depend on repository/event publisher ports only.
- Kysely code stays in `infrastructure/persistence`.
- Event bus adapters stay in `infrastructure/adapters`.
- Domain files must not import NestJS, Kysely, HTTP, GraphQL, Next.js, or Electron.
- Write use cases publish domain events only after successful persistence.
- Preserve existing HTTP routes and response shape unless the user explicitly asks for an API change.
- Add architecture tests that fail if a migrated controller imports a repository again.

Frontend target shape:

```text
apps/frontend/features/<module-name>/
  domain/
  application/
  infrastructure/
  interface/
    pages/
```

Frontend rules for upcoming slices:

- App routes under `apps/frontend/app/` should import pages only from `features/<module>/interface/pages`.
- Browser/network/storage adapters belong in `infrastructure`.
- Filtering, mapping, and use-case style orchestration belong in `application`.
- Types, constants, and module concepts belong in `domain`.
- Keep existing route behavior stable while moving files.

Validation checklist for each implementation batch:

- `C:\Users\sunda\AppData\Roaming\npm\pnpm.cmd --filter @cxnext/server typecheck` for backend work.
- `C:\Users\sunda\AppData\Roaming\npm\pnpm.cmd --filter @cxnext/frontend typecheck` for frontend work.
- Targeted ESLint on changed files.
- Focused Vitest coverage for the migrated module.
- `tests/architecture/version-sync.test.ts`.
- `tests/architecture/source-tree-artifacts.test.ts`.
- Optional browser smoke test only after frontend UI behavior changes.

## Active

- [x] `#51` Plan remaining modular boundary refactors
  - [x] Phase 1: review current boundary state
    - [x] 1.1 inspect backend module shape, direct repository access, and remaining common child masters
    - [x] 1.2 inspect frontend feature shape and oversized UI/page files
  - [x] Phase 2: publish upcoming module roadmap
    - [x] 2.1 clear completed execution notes from task and planning files
    - [x] 2.2 write the complete upcoming task backlog in execution tracking
    - [x] 2.3 write the implementation plan, sequence, constraints, and validation approach
  - [x] Phase 3: validation
    - [x] 3.1 run lightweight planning validation checks
    - [x] 3.2 update changelog and synchronized versions for the planning batch

## Upcoming

- [ ] `#52` Refactor common contact masters
  - [ ] Move `contact-groups`, `contact-types`, `address-types`, and `bank-names` behind common master domain/application/infrastructure/interface layers.
  - [ ] Replace controller-to-repository access with use cases and ports.
  - [ ] Add create/update/delete domain events and event-bus publication.
  - [ ] Add focused boundary and event tests.

- [ ] `#53` Refactor common product taxonomy masters
  - [ ] Move `product-groups`, `product-categories`, and `product-types` behind common master use cases and repository ports.
  - [ ] Keep taxonomy-specific validation in domain/value-object helpers.
  - [ ] Add focused boundary and event tests.

- [ ] `#54` Refactor common product attribute masters
  - [ ] Move `brands`, `colours`, `sizes`, `styles`, and `units` behind the common master DDD/application flow.
  - [ ] Keep controllers thin and share only common master interface helpers.
  - [ ] Add focused boundary and event tests.

- [ ] `#55` Refactor common compliance masters
  - [ ] Move `hsn-codes` and `taxes` behind use cases, ports, and infrastructure adapters.
  - [ ] Keep tax-specific fields out of generic controller code.
  - [ ] Add focused tests for tax/HSN persistence mapping and write events.

- [ ] `#56` Refactor common order and logistics masters
  - [ ] Move `warehouses`, `transports`, `destinations`, `order-types`, and `stock-rejection-types` behind common master boundaries.
  - [ ] Preserve current API shape while moving orchestration into application use cases.
  - [ ] Add focused boundary and event tests.

- [ ] `#57` Refactor common finance and terms masters
  - [ ] Move `currencies` and `payment-terms` behind common master boundaries.
  - [ ] Add write events and tests for expected status/delete behavior.

- [ ] `#58` Harden backend domain models
  - [ ] Replace placeholder backend DDD folders in `companies`, `industries`, and applicable common areas with small real domain entities/value objects where useful.
  - [ ] Add update/delete domain events where write use cases currently publish only create events or no events.
  - [ ] Add architecture tests that prevent framework imports in domain folders.

- [ ] `#59` Refactor frontend feature module shells
  - [ ] Add missing `infrastructure` folders to `common`, `company`, and `industry`.
  - [ ] Move feature API/browser adapters out of application/interface files.
  - [ ] Add structure tests for frontend bounded contexts.

- [ ] `#60` Refactor frontend common and location features
  - [ ] Split common master pages and location pages into smaller application/interface units.
  - [ ] Keep routes importing only from `features/<module>/interface/pages`.
  - [ ] Add tests or static checks for route import boundaries.

- [ ] `#61` Refactor frontend desk and cxsun features
  - [ ] Move `desk` and `cxsun` from flat feature folders into `domain`, `application`, `infrastructure`, and `interface/pages`.
  - [ ] Preserve route behavior and portal registry contracts.
  - [ ] Add structure tests for both feature folders.

- [ ] `#62` Split oversized dashboard shell UI
  - [ ] Decompose `packages/ui/src/blocks/dashboard/dashboard-shell.tsx` into smaller shell, navigation, header, content, and utility modules.
  - [ ] Keep public exports stable from `packages/ui`.
  - [ ] Add focused typecheck/lint validation.

- [ ] `#63` Split oversized frontend feature pages
  - [ ] Split `tenant-pages.tsx`, `company-pages.tsx`, `industry-pages.tsx`, and `common-pages.tsx` into list/show/upsert/helpers modules.
  - [ ] Keep route imports stable through page barrels or existing public page files.
  - [ ] Add file-size architecture coverage.

- [ ] `#64` Add final boundary enforcement suite
  - [ ] Add architecture tests for backend strict folders, frontend strict folders, controller repository access, domain framework imports, and file-size thresholds.
  - [ ] Run full server/frontend typecheck and focused lint.
