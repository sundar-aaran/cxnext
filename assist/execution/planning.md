# Planning

Active reference: `#78`

## Active

- `#78` Fix container update Compose execution
  - Goal:
    - Make the in-app setup and system update build/restart actions work from the Docker container by ensuring a Compose command is available and consistently resolved.
  - Scope:
    - `.container/Dockerfile` runtime tooling.
    - `scripts/system-update.mjs` Compose resolution and diagnostics.
    - `scripts/setup.mjs` Compose build/start/prepare-db commands.
    - Workspace version/changelog alignment for `1.0.78`.
    - Local Docker E2E validation.
  - Constraints:
    - Keep the app compose file path unchanged.
    - Continue supporting both `docker compose` and `docker-compose`.
    - Do not change database contents except by non-destructive prepare/status checks.
  - Planned validation:
    - Build the app image locally through `.container/docker-compose.yml`.
    - Restart the app container.
    - Run system update preflight and build commands inside the running container.
    - Confirm package/changelog version alignment.
  - Implemented:
    - Installed Docker Compose v2.29.7 into the app image as both the Docker CLI plugin and `docker-compose` compatibility command.
    - Updated setup Docker actions to try `docker compose` first and fall back to `docker-compose`.
    - Added detached helper-container restart handling for setup and system update actions that are run from inside `cxnext-app`.
    - Updated `.container/docker-compose.yml` to support an explicit `DEPLOY_SOURCE` bind mount override during helper-driven restarts.
    - Synchronized workspace package manifests and changelog state to `1.0.78`.
  - Validation:
    - Passed `docker compose -f .container/docker-compose.yml config --quiet`.
    - Passed local `docker compose -f .container/docker-compose.yml build app`.
    - Passed local `docker compose -f .container/docker-compose.yml up -d app`.
    - Confirmed the running container has Docker Compose v2.29.7.
    - Passed in-container `node scripts/system-update.mjs preflight --json`.
    - Passed in-container `node scripts/system-update.mjs build --json`.
    - Passed in-container `node scripts/system-update.mjs restart --json`.
    - Confirmed helper-driven restart preserved `/deploy/cxnext` as the real host bind mount and `/health` returned HTTP 200.
  - Residual risk:
    - The Compose v2 binary URL is pinned to the amd64 Linux release; non-amd64 production hosts would need a matching binary target.
