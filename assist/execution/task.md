# Task

Active reference: `#46`

## Active

- [x] `#46` Refactor company module read boundaries
  - [x] Phase 1: establish implementation baseline
    - [x] 1.1 read assist guide, module boundary, DDD, and version rules
    - [x] 1.2 create branch and refresh execution tracking
  - [x] Phase 2: remove cross-module persistence joins
    - [x] 2.1 add company application ports for tenant and industry display lookups
    - [x] 2.2 implement lookup adapters without importing other module internals
    - [x] 2.3 update company repository to query only company-owned tables
  - [x] Phase 3: register providers and preserve API shape
    - [x] 3.1 wire lookup adapters in `CompaniesModule`
    - [x] 3.2 preserve `tenantName` and `industryName` response fields
  - [x] Phase 4: validate and prepare PR
    - [x] 4.1 run targeted server typecheck/tests/lint
    - [x] 4.2 update changelog/version tracking
    - [ ] 4.3 commit, push branch, and create PR when tooling permits
