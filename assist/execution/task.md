# Task

Active reference: `#51`

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
