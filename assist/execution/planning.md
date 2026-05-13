# Planning

Active reference: `#91`

## Active

- `#91` Fix System Update versioned deploy route
  - Goal:
    - Fix `Cannot POST /v1/system-update/deploy` from the System Update page and make the update action wording clearer.
  - Scope:
    - Backend versioned API URL rewrite.
    - Frontend System Update action labels.
    - Execution log and changelog.
  - Constraints:
    - Preserve the existing `/api/v1` API surface.
    - Keep the existing System Update controller action names and service behavior.
  - Planned validation:
    - Run focused server and frontend typechecks.
  - Implemented:
    - Updated the Fastify rewrite helper to accept both `/api/v1` and `/v1`.
    - Kept `/system-update/deploy` backend controller wiring unchanged.
    - Renamed the deploy button to `Pull GitHub, Build & Restart`.
    - Renamed manual sync to `Pull latest GitHub version`.
    - Added the `v 1.0.91` changelog entry.
  - Validation:
    - `pnpm --filter @cxnext/server typecheck`
    - `pnpm --filter @cxnext/frontend typecheck`
  - Residual risk:
    - Runtime browser/deployed server smoke was not run in this pass.
