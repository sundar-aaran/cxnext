# Planning

Active reference: `#71`

## Active

- `#71` Add admin authorization management
  - Goal:
    - Add proper Roles, Permissions, Policy, and Gate administration connected to users, preserving modular monolith, DDD, and event-driven boundaries.
  - Scope:
    - Existing Auth bounded context backend and frontend auth/admin feature pages.
    - Desk sidebar Admin menu entries.
  - Constraints:
    - Extend the existing auth module rather than creating a duplicate security module.
    - Keep domain code framework-free and persistence behind repository interfaces.
    - Publish auth access/domain events through the existing event bus adapter.
    - Do not modify unrelated dirty worktree changes.
    - Keep the active reference aligned with the current changelog state `1.0.72`.
  - Planned validation:
    - Run focused server and frontend typechecks.
  - Implemented:
    - Extended the existing Auth bounded context with role create/update repository methods, permission key validation, role access domain events, policy catalog output, and effective user gate output.
    - Added Auth HTTP endpoints for role writes plus policy and gate reads.
    - Added frontend Auth API methods, Admin routes/pages for Roles, Permissions, Policy, and Gate, and Admin sidebar entries.
  - Validation:
    - `corepack pnpm --filter @cxnext/server typecheck`
    - `corepack pnpm --filter @cxnext/frontend typecheck`
  - Residual risk:
    - Role writes currently depend on existing database uniqueness constraints for duplicate role keys.
  - Refinement:
    - Split Roles away from permission assignment so it behaves like a simple master list.
    - Keep permission and policy catalog data read-only, and surface user-specific role, permission, and policy relationships from the user show page.
  - Refinement implemented:
    - Removed permission selection from Role create/edit and added protected role delete.
    - Grouped Permission records by module and kept Policy as the detailed definition matrix.
    - Added a User show route with animated Role, Permission, and Policy tabs.
    - Simplified User upsert to identity/session content, with user list and gate rows opening the show page.
  - Refinement validation:
    - `corepack pnpm --filter @cxnext/server typecheck`
    - `corepack pnpm --filter @cxnext/frontend typecheck`
  - Role simplification:
    - Reduced seeded roles to Super Admin, Admin, Manager, Operator, Viewer, Web Client, and Premium Client.
    - Reworked Roles admin into a Common-list-style popup upsert workflow and removed standalone role upsert routes.
    - Revalidated `@cxnext/frontend`, `@cxnext/server`, `@cxnext/db`, and `@cxnext/types` typechecks.
