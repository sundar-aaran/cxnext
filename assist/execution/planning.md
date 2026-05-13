# Planning

Active reference: `#92`

## Active

- `#92` Harden client startup readiness on deployed boot
  - Goal:
    - Remove the production startup race that lets client traffic hit the frontend before the backend and app container are fully ready.
  - Scope:
    - Production startup script `scripts/start.mjs`
    - Container runtime health reporting in `.container/Dockerfile`
    - Setup and system-update restart flows in `scripts/setup.mjs` and `scripts/system-update.mjs`
    - Execution log, changelog, and lockstep version update
  - Constraints:
    - Keep the existing single-container deployment model.
    - Improve readiness without changing public route structure or proxy hostnames.
    - Avoid treating transient cold-start lag as a healthy state.
  - Planned validation:
    - Run `node --check` on each touched startup script.
    - Run `pnpm --filter @cxnext/server typecheck`.
  - Implemented:
    - Changed production startup so the Nest API starts first and the script waits for `/health` before launching Next.
    - Added a second readiness wait so the startup script only reports ready after the frontend answers locally as well.
    - Added a Docker health check that verifies both backend health and frontend HTML reachability inside the app container.
    - Added wait-for-healthy behavior to setup and system-update restart flows, including the detached in-container restart helper path.
  - Validation:
    - `node --check scripts/start.mjs`
    - `node --check scripts/setup.mjs`
    - `node --check scripts/system-update.mjs`
    - `pnpm --filter @cxnext/server typecheck`
  - Residual risk:
    - A user who opens the public URL during the exact container replacement window can still see a browser-level connection error; this batch shortens that window and prevents the app from reporting ready before it is actually ready, but it does not provide zero-downtime blue-green deployment.
