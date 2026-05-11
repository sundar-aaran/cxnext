# Task

Active reference: `#71`

## Active

- [x] `#71` Refine admin authorization management
  - [x] Phase 1: inspect existing auth architecture
    - [x] 1.1 Read assist guidance and module rules.
    - [x] 1.2 Inspect auth module, user admin use cases, persistence, and desk sidebar.
  - [x] Phase 2: backend authorization model
    - [x] 2.1 Extend auth repository/use cases for roles, permissions, policies, and gates.
    - [x] 2.2 Add domain events for role and access changes.
    - [x] 2.3 Add HTTP endpoints for admin authorization management.
  - [x] Phase 3: frontend admin UI
    - [x] 3.1 Add Roles, Permissions, Policy, and Gate admin routes/pages.
    - [x] 3.2 Connect admin pages to backend APIs.
    - [x] 3.3 Add sidebar menu entries under Admin.
  - [x] Phase 4: validation and tracking
    - [x] 4.1 Run focused typecheck/build validation.
    - [x] 4.2 Update changelog and execution notes.
  - [x] Phase 5: split role, permission, policy, and user access surfaces
    - [x] 5.1 Make Roles a master list with create, edit, delete only.
    - [x] 5.2 Make Permissions a module-grouped catalog and Policy the detailed definition view.
    - [x] 5.3 Move user access review to a user show page with Role, Permission, and Policy tabs.
    - [x] 5.4 Revalidate focused server and frontend typechecks.
