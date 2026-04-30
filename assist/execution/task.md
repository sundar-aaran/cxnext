# Task

Active reference: `#58`

## Next Agent Handoff

Start here before any new implementation:

1. Read `assist/Readme.md`, `assist/agent.md`, `assist/rules/execution-tracking.md`, `assist/rules/strict-module-structure.md`, `assist/rules/module-boundaries.md`, `assist/rules/import-restrictions.md`, `assist/rules/versioning-and-releases.md`, `assist/standards/ddd.md`, `assist/standards/event-driven.md`, and `assist/standards/modular-monolith.md`.
2. Keep working directly on `main` unless the user asks for a branch.
3. Continue the current `## Active` task. If it is complete, move its completed details to `assist/documentation/CHANGELOG.md`, then promote the first unchecked item from `## Upcoming` into `## Active`.
4. Use reference/version alignment:
   - `#58` means package version `1.0.58`.
   - changelog section `## v-1.0.58`.
   - changelog entry `### [v 1.0.58] YYYY-MM-DD - Title`.
   - commit subject starts with `#58`.
5. Do not copy completed task details forward. Completed history belongs in `assist/documentation/CHANGELOG.md`.

Command flow:

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
node scripts/version-sync.mjs --ref <reference>
C:\Users\sunda\AppData\Roaming\npm\pnpm.cmd --filter @cxnext/server typecheck
C:\Users\sunda\AppData\Roaming\npm\pnpm.cmd exec vitest run <focused-tests> tests/architecture/version-sync.test.ts tests/architecture/source-tree-artifacts.test.ts
git diff --check
git add <changed-files>
git commit -m "#<reference> <type>(<scope>): <summary>"
git push origin main
```

## Active

- [x] `#58` Harden backend domain models
  - [x] Replace placeholder backend DDD folders in `companies` and `industries` with small real domain entities, aggregates, and value objects.
  - [x] Add create/update/delete domain events for company and industry write use cases.
  - [x] Add architecture tests that prevent framework imports in backend domain folders.

## Upcoming

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

- [ ] `#64` Add frontend/backend route and module boundary checks
  - [ ] Add architecture tests for frontend route imports, backend controller repository access, and domain framework imports.
  - [ ] Keep tests readable and cheap enough for regular local runs.
  - [ ] Run focused server/frontend typecheck and architecture tests.

- [ ] `#65` Add final boundary enforcement suite
  - [ ] Add permanent architecture coverage for strict backend folders, strict frontend folders, generated source artifacts, version sync, and file-size thresholds.
  - [ ] Run full server/frontend typecheck and focused lint.
  - [ ] Leave a clean final checklist for any remaining modules.

- [ ] `#66` Build contact list/show/upsert module from `temp/apps/core`
  - [ ] Read the contact source references in `## Contact Module Reference`.
  - [ ] Create backend `contacts` bounded context with domain/application/infrastructure/interface/database folders.
  - [ ] Implement contact list/show/create/update/delete use cases, repository port, Kysely adapter, thin HTTP controller, GraphQL model/resolver placeholders, and create/update/delete domain events.
  - [ ] Model contact type, ledger reference, legal/tax fields, opening balance, credit limit, addresses, emails, phones, bank accounts, and GST details.
  - [ ] Create frontend `contact` strict module with domain/application/infrastructure/interface pages for list, show, and upsert.
  - [ ] Keep lookup dependencies on common masters behind application ports or API calls; do not cross-join common master tables inside the contact repository.
  - [ ] Add focused tests for contact use cases, event publication, controller boundaries, frontend route imports, and architecture rules.

- [ ] `#67` Build product list/show/upsert module from `temp/apps/core`
  - [ ] Read the product source references in `## Product Module Reference`.
  - [ ] Create backend `products` bounded context with domain/application/infrastructure/interface/database folders.
  - [ ] Implement product list/show/create/update/delete use cases plus slug and SEO helper use cases, repository port, Kysely adapter, thin HTTP controller, GraphQL model/resolver placeholders, and create/update/delete domain events.
  - [ ] Model brand/category/group/type/unit/HSN/style/tax references, SKU, pricing, images, variants, discounts, offers, attributes, stock, SEO, storefront settings, tags, and reviews.
  - [ ] Create frontend `product` strict module with domain/application/infrastructure/interface pages for list, show, and upsert.
  - [ ] Keep lookup dependencies on common masters behind application ports or API calls; do not cross-join common master tables inside the product repository.
  - [ ] Add focused tests for product use cases, event publication, controller boundaries, frontend route imports, and architecture rules.

## Backend Rules

- Controllers must not inject repositories directly.
- Controllers call application use cases only.
- Application use cases depend on repository/event publisher ports only.
- Kysely code stays in `infrastructure/persistence`.
- Event bus adapters stay in `infrastructure/adapters`.
- Domain files must not import NestJS, Kysely, HTTP, GraphQL, Next.js, or Electron.
- Write use cases publish domain events only after successful persistence.
- Preserve existing HTTP routes and response shape unless the user explicitly asks for an API change.
- Add architecture tests that fail if a migrated controller imports a repository again.

## Frontend Rules

- App routes under `apps/frontend/app/` should import pages only from `features/<module>/interface/pages`.
- Browser/network/storage adapters belong in `infrastructure`.
- Filtering, mapping, and use-case style orchestration belong in `application`.
- Types, constants, and module concepts belong in `domain`.
- Keep existing route behavior stable while moving files.

## Validation Checklist

- `C:\Users\sunda\AppData\Roaming\npm\pnpm.cmd --filter @cxnext/server typecheck` for backend work.
- `C:\Users\sunda\AppData\Roaming\npm\pnpm.cmd --filter @cxnext/frontend typecheck` for frontend work.
- Targeted ESLint on changed files.
- Focused Vitest coverage for the migrated module.
- `tests/architecture/version-sync.test.ts`.
- `tests/architecture/source-tree-artifacts.test.ts`.
- Optional browser smoke test only after frontend UI behavior changes.

## Common Master Reference

Target shape:

```text
apps/server/src/modules/common/
  domain/
    entities/common-master-record.ts
    entities/common-location-record.ts
    value-objects/common-master-definition.ts
    value-objects/common-location-definition.ts
    events/common-master-record-created.event.ts
    events/common-master-record-updated.event.ts
    events/common-master-record-deleted.event.ts
  application/
    services/common-master.repository.ts
    services/common-location.repository.ts
    services/domain-event-publisher.ts
    use-cases/<group-name>/list-<group-name>-records.use-case.ts
    use-cases/<group-name>/get-<group-name>-record.use-case.ts
    use-cases/<group-name>/create-<group-name>-record.use-case.ts
    use-cases/<group-name>/update-<group-name>-record.use-case.ts
    use-cases/<group-name>/delete-<group-name>-record.use-case.ts
  infrastructure/
    persistence/kysely-<group-name>.repository.ts
    adapters/event-bus-domain-event-publisher.ts
    <group-name>.providers.ts
  interface/
    http/<group-name>-controller.ts
```

Concrete files:

```text
apps/server/src/modules/common/application/use-cases/contact-masters/list-contact-master-records.use-case.ts
apps/server/src/modules/common/infrastructure/persistence/kysely-contact-master.repository.ts
apps/server/src/modules/common/interface/http/contact-master-controller.ts
tests/architecture/common-contact-master-boundaries.test.ts
tests/server/common/contact-master-use-cases.test.ts
```

## Contact Module Reference

Source references:

```text
temp/apps/core/shared/schemas/contact.ts
temp/apps/core/shared/schemas/address-book.ts
temp/apps/core/src/services/contact-service.ts
temp/apps/core/database/migration/03-contacts.ts
temp/apps/core/database/migration/10-contact-code-backfill.ts
temp/apps/core/database/seeder/03-contacts.ts
temp/apps/core/web/src/features/contact/contact-form-state.ts
temp/apps/core/web/src/features/contact/contact-form-sections.tsx
temp/apps/core/web/src/features/contact/contact-upsert-section.tsx
```

Target shape:

```text
apps/server/src/modules/contacts/
  contacts.module.ts
  domain/entities/contact.entity.ts
  domain/value-objects/contact-code.value-object.ts
  domain/value-objects/contact-address.value-object.ts
  domain/events/contact-created.event.ts
  domain/events/contact-updated.event.ts
  domain/events/contact-deleted.event.ts
  application/services/contact.repository.ts
  application/services/domain-event-publisher.ts
  application/use-cases/list-contacts.use-case.ts
  application/use-cases/get-contact.use-case.ts
  application/use-cases/create-contact.use-case.ts
  application/use-cases/update-contact.use-case.ts
  application/use-cases/delete-contact.use-case.ts
  infrastructure/persistence/kysely-contact.repository.ts
  infrastructure/adapters/event-bus-domain-event-publisher.ts
  infrastructure/contacts.providers.ts
  interface/http/contacts.controller.ts
  interface/graphql/contact.model.ts
  interface/graphql/contacts.resolver.ts
  database/migrations/001-create-contacts.ts
  database/seeders/001-seed-contacts.ts

apps/frontend/features/contact/
  domain/contact.ts
  domain/contact-form.ts
  application/contact-list.service.ts
  application/contact-upsert.service.ts
  infrastructure/contact-api.ts
  interface/pages/contact-list-page.tsx
  interface/pages/contact-show-page.tsx
  interface/pages/contact-upsert-page.tsx
  interface/components/contact-form-sections.tsx
```

## Product Module Reference

Source references:

```text
temp/apps/core/shared/schemas/product.ts
temp/apps/core/src/services/product-service.ts
temp/apps/core/database/migration/12-products.ts
temp/apps/core/database/seeder/08-products.ts
temp/apps/core/src/data/product-seed.ts
temp/apps/core/web/src/features/product/product-form-state.ts
temp/apps/core/web/src/features/product/product-form-sections.tsx
temp/apps/core/web/src/features/product/product-upsert-section.tsx
```

Target shape:

```text
apps/server/src/modules/products/
  products.module.ts
  domain/entities/product.entity.ts
  domain/value-objects/product-code.value-object.ts
  domain/value-objects/product-slug.value-object.ts
  domain/value-objects/product-pricing.value-object.ts
  domain/events/product-created.event.ts
  domain/events/product-updated.event.ts
  domain/events/product-deleted.event.ts
  application/services/product.repository.ts
  application/services/domain-event-publisher.ts
  application/use-cases/list-products.use-case.ts
  application/use-cases/get-product.use-case.ts
  application/use-cases/create-product.use-case.ts
  application/use-cases/update-product.use-case.ts
  application/use-cases/delete-product.use-case.ts
  application/use-cases/generate-product-slug.use-case.ts
  application/use-cases/generate-product-seo-field.use-case.ts
  infrastructure/persistence/kysely-product.repository.ts
  infrastructure/adapters/event-bus-domain-event-publisher.ts
  infrastructure/products.providers.ts
  interface/http/products.controller.ts
  interface/graphql/product.model.ts
  interface/graphql/products.resolver.ts
  database/migrations/001-create-products.ts
  database/seeders/001-seed-products.ts

apps/frontend/features/product/
  domain/product.ts
  domain/product-form.ts
  application/product-list.service.ts
  application/product-upsert.service.ts
  infrastructure/product-api.ts
  interface/pages/product-list-page.tsx
  interface/pages/product-show-page.tsx
  interface/pages/product-upsert-page.tsx
  interface/components/product-form-sections.tsx
```
