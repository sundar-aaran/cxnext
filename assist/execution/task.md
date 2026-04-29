# Task

Active reference: `#45`

## Active

- [x] `#45` Refactor tenant module write boundaries and events
  - [x] Phase 1: establish implementation baseline
    - [x] 1.1 read assist guide, DDD, event, and strict module rules
    - [x] 1.2 create branch and refresh execution tracking
  - [x] Phase 2: move tenant writes behind application use cases
    - [x] 2.1 add tenant create, update, and delete use cases
    - [x] 2.2 update HTTP and GraphQL interfaces to call use cases instead of repositories
  - [x] Phase 3: publish tenant domain events
    - [x] 3.1 bridge core domain events to the app event bus
    - [x] 3.2 publish aggregate events after successful tenant creation
  - [x] Phase 4: validate and prepare PR
    - [x] 4.1 run targeted server tests/typecheck
    - [x] 4.2 update changelog/version tracking
    - [x] 4.3 commit and push branch
    - [ ] 4.4 create PR after GitHub CLI or token is available
