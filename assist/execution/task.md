# Task

Active reference: `#91`

## Active

- [x] `#91` Fix System Update versioned deploy route
  - [x] Phase 1: trace failing route
    - [x] 1.1 Inspect System Update frontend action URLs.
    - [x] 1.2 Inspect backend System Update controller and versioned API rewrite.
  - [x] Phase 2: implementation
    - [x] 2.1 Add `/v1` as an accepted versioned API prefix alongside `/api/v1`.
    - [x] 2.2 Refactor System Update action wording for GitHub pull/update clarity.
  - [x] Phase 3: validation and log
    - [x] 3.1 Run focused server and frontend typechecks.
    - [x] 3.2 Add changelog entry under `v 1.0.91`.
