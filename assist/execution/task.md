# Task

Active reference: `#91`

## Active

- [x] `#91` Harden queue startup when queue tables are missing
  - [x] Phase 1: inspect failure path
    - [x] 1.1 Review deployed crash logs and locate the queue bootstrap failure in the local worker poller.
    - [x] 1.2 Confirm the crash is caused by a missing `queue_jobs` table on cloud databases that have not run the latest migrations.
  - [x] Phase 2: implement graceful degradation
    - [x] 2.1 Wrap queue polling so missing-table failures disable the worker and log a clear migration warning instead of crashing the process.
    - [x] 2.2 Guard queue API entry points so they return a controlled unavailable response once queue storage is disabled.
  - [x] Phase 3: validate and track
    - [x] 3.1 Run focused server typecheck validation for the queue service refactor.
    - [x] 3.2 Refresh execution tracking and release alignment for batch `#91`.
