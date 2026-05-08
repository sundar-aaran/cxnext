# Planning

Active reference: `#70`

## Active

- `#70` Hide empty Sales print barcode divider
  - Goal:
    - Remove the visual divider beside the company header when the e-invoice barcode area is empty.
  - Scope:
    - Sales invoice print header styling.
  - Constraints:
    - Preserve the divider when real IRN and signed QR data exists.
    - Leave missing data blank.
    - Do not modify unrelated dirty worktree changes.
    - Keep the active reference aligned with the current package version `1.0.70`.
  - Planned validation:
    - Run focused frontend typecheck.
  - Implemented:
    - Added an e-invoice barcode availability check in the Sales print header.
    - Removed the company header right divider when IRN or signed QR data is missing.
    - Added a `v 1.0.70` changelog entry for hiding the empty barcode divider.
  - Validation:
    - Ran `corepack pnpm --filter @cxnext/frontend typecheck`.
  - Residual risk:
    - Existing unrelated working-tree changes remain untouched.
