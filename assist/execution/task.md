# Task

Active reference: `#50`

## Active

- [x] `#50` Refactor common location boundaries
  - [x] Phase 1: establish location baseline
    - [x] 1.1 inspect common location controllers, modules, and shared repository flow
    - [x] 1.2 refresh execution tracking for the new batch
  - [x] Phase 2: align location DDD layers
    - [x] 2.1 move location definitions and records into domain/application contracts
    - [x] 2.2 route location HTTP handlers through application use cases
    - [x] 2.3 publish location domain events after writes through an event-bus adapter
    - [x] 2.4 move Kysely persistence behind the location repository port
  - [x] Phase 3: validation and release notes
    - [x] 3.1 add focused boundary and event coverage
    - [x] 3.2 run targeted validation
    - [x] 3.3 update changelog and synchronized versions
