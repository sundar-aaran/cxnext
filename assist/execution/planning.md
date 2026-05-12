# Planning

Active reference: `#83`

## Active

- `#83` Server-backed company settings
  - Goal:
    - Persist Sales Settings, Duties & Taxes, Apps, Customise, and Features settings on the backend per company so settings are shared across devices and protected by existing access controls.
  - Scope:
    - Existing company-scoped settings pages and storage helpers.
    - Backend persistence/API needed for generic company settings categories.
    - Frontend load/save wiring for the affected settings.
  - Constraints:
    - Keep settings isolated by active company.
    - Preserve current UI behavior and existing setting shapes.
    - Follow existing module boundaries and permission patterns.
  - Planned validation:
    - Run focused frontend/server/db typechecks where affected.
    - Search for remaining browser-only storage usage for the target settings.
  - Implemented:
    - pending
  - Validation:
    - pending
  - Residual risk:
    - pending
