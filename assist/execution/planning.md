# Planning

Active reference: `#86`

## Active

- `#86` Billing workspace side menu
  - Goal:
    - Create a dedicated Billing workspace and show a Billing-focused side menu when the breadcrumb/app switch is on Billing.
  - Scope:
    - Desk registry/app switcher.
    - Billing workspace page.
    - Desk shell sidebar grouping for Billing vs Application/other pages.
    - Release tracking/version alignment.
  - Constraints:
    - Billing sidebar order must be Overview, Entries, Reports, Master, Common.
    - Entries must connect Sales, Purchase, Receipt, and Payment.
    - Reports, Master, and Common must connect existing billing-related pages.
    - Existing Application desk/admin organisation menus should remain available outside Billing.
  - Planned validation:
    - Run focused frontend typecheck.
  - Implemented:
    - Added Billing to the desk registry and app switcher.
    - Added a Billing overview workspace page with entry, report, and master shortcuts.
    - Replaced the old `/desk/billing` account scaffold route with the Billing workspace.
    - Added Billing route detection so Sales, Purchase, Receipt, Payment, Reports, Contact, Product, and Common pages show the Billing side menu.
    - Added a Billing-focused sidebar ordered as Overview, Entries, Reports, Master, and Common.
    - Kept organisation, settings, admin, and other application menus on the Application desk side menu outside Billing.
  - Validation:
    - `pnpm --filter @cxnext/frontend typecheck` passed.
    - `pnpm --filter @cxnext/ui typecheck` passed.
  - Residual risk:
    - Runtime browser walkthrough was not run in this pass.
    - `packages/ui/src/blocks/dashboard/dashboard-shell-root.tsx` was already above the repository file-size guideline before this change; this pass kept the shell change narrowly scoped.
