# Task

Active reference: `#92`

## Active

- [x] `#92` Harden client startup readiness on deployed boot
  - [x] Phase 1: inspect startup race
    - [x] 1.1 Review deployed startup behavior, client container flow, and public proxy wiring.
    - [x] 1.2 Confirm that production startup can expose the frontend before the backend and container are fully ready.
  - [x] Phase 2: implement readiness guards
    - [x] 2.1 Start the backend first in production and wait for API health before starting the frontend.
    - [x] 2.2 Add container health checks and wait-for-healthy behavior to setup and system-update restart flows.
  - [x] Phase 3: validate and track
    - [x] 3.1 Run syntax checks for the touched startup scripts and a focused server typecheck.
    - [x] 3.2 Refresh changelog, execution tracking, and lockstep version alignment for `1.0.92`.
