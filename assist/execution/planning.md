# Planning

Active reference: `#80`

## Active

- `#80` Add settings apps module page
  - Goal:
    - Add an Odoo-style Settings Apps page where app modules are grouped into full-page sections and each card can be toggled as enabled.
  - Scope:
    - Settings sidebar/index menu registration.
    - New `/desk/settings/apps` page.
    - Grouped frontend-only app module cards with icons, titles, descriptions, and enabled status.
    - Workspace version and changelog alignment for `1.0.80`.
  - Constraints:
    - Keep the new page frontend-only and avoid backend persistence.
    - Preserve current settings layout patterns and sidebar behavior.
    - Avoid adding more bulk to the large settings page file.
  - Planned validation:
    - Run focused frontend typecheck.
    - Confirm the new route imports and settings menu labels are wired.
  - Implemented:
    - Added `/desk/settings/apps` route and `AppsSettingsPage`.
    - Added Settings > Apps in the settings sidebar and Settings index page.
    - Built grouped app module sections with icon cards, descriptions, enabled check states, keyboard toggling, and local storage persistence.
    - Synchronized workspace package manifests and changelog state to `1.0.80`.
  - Validation:
    - Passed `pnpm --filter @cxnext/frontend typecheck`.
    - Confirmed the new route import, settings sidebar item, settings index card, and changelog/version state are present.
  - Residual risk:
    - App module enabled state is frontend-local only and does not yet persist to backend settings.
