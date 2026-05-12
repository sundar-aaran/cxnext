# Task

Active reference: `#83`

## Active

- [ ] `#83` Server-backed company settings
  - [ ] Phase 1: trace current settings storage
    - [ ] 1.1 Find local storage usage for Sales Settings, Duties & Taxes, Apps, Customise, and Features.
    - [ ] 1.2 Inspect backend company/settings module patterns and permission guards.
  - [ ] Phase 2: implementation
    - [ ] 2.1 Add backend persistence for company-scoped settings.
    - [ ] 2.2 Add settings API endpoints protected by existing auth/role flow.
    - [ ] 2.3 Wire frontend settings pages to server-backed storage with local fallback only where needed.
  - [ ] Phase 3: validation
    - [ ] 3.1 Run focused typechecks.
    - [ ] 3.2 Update changelog/version tracking.
