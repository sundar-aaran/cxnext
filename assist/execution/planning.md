# Planning

Active reference: `#89`

## Active

- `#89` Add external env support for packaged Electron builds
  - Goal:
    - Let packaged Electron builds read configuration from an external env file outside the bundle so runtime credentials and endpoints can be changed without rebuilding the desktop app.
  - Scope:
    - Desktop env resolution in `apps/desktop/src/main.ts`
    - Build output support for an editable sidecar sample env file
    - Execution tracking, changelog, and lockstep version update
  - Constraints:
    - Preserve repo-root `.env` fallback for local development.
    - Support explicit env-file overrides and packaged sidecar env discovery.
    - Keep credentials outside the app bundle so they can be edited after install/build.
  - Planned validation:
    - Run `pnpm --filter @cxnext/desktop typecheck`
    - Run any additional touched workspace typecheck if needed
  - Implemented:
    - Added layered env resolution in `apps/desktop/src/main.ts` so packaged Electron startup now looks for config in this order across file layers: repo root fallback, packaged sidecar env beside the executable or resources directory, and explicit env-file override via `CXNEXT_ENV_FILE` or `DESKTOP_ENV_FILE`.
    - Preserved shell environment variable precedence by merging file-based env values first and only filling keys that are not already present in `process.env`.
    - Added `CXNEXT_ENV_SOURCE` runtime metadata so the active env file source can be inspected if needed.
    - Added `apps/desktop/env.desktop.sample` as an editable sidecar template containing endpoint, service-management, timeout, and DB credentials keys.
    - Configured Electron Builder `extraFiles` to place `env.desktop.sample` outside the bundled app content so operators can copy and edit it after packaging.
    - Synchronized workspace package versions to `1.0.89`.
  - Validation:
    - `pnpm --filter @cxnext/desktop typecheck`
    - `pnpm --filter @cxnext/frontend typecheck`
  - Residual risk:
    - The packaged desktop app can now read external env files, but its service startup model still assumes access to the repo/workspace when `DESKTOP_START_SERVICES=true`; fully standalone embedded runtime packaging remains a separate step.
