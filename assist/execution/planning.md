# Planning

Active reference: `#70`

## Active

- `#70` Finalise Sales invoice print with real data
  - Goal:
    - Make the Sales print page render from saved Sales and company data, leaving unavailable fields blank.
  - Scope:
    - Sales show print wiring and Sales invoice print template.
  - Constraints:
    - Do not show dummy customer address, fake GSTIN, fake IRN/Ack, fake QR, or placeholder dashes for missing data.
    - Keep print route behavior connected to `/desk/sales/:id?print=1`.
    - Do not modify unrelated dirty worktree changes.
    - Keep the active reference aligned with the current package version `1.0.70`.
  - Planned validation:
    - Run focused frontend typecheck.
  - Implemented:
    - Passed the loaded primary company from the Sales show page into the Sales invoice print document.
    - Replaced static company, logo, GSTIN, IRN, Ack, e-way, QR, party-address, and bank placeholder values with real data or blank output.
    - Removed the visible print line diagnostic panel from the final Sales show/print page.
    - Added a `v 1.0.70` changelog entry for final Sales invoice print data wiring.
  - Validation:
    - Ran `corepack pnpm --filter @cxnext/frontend typecheck`.
  - Residual risk:
    - Existing unrelated working-tree changes remain untouched.
    - Party GSTIN/state and rendered QR image generation remain blank until those source fields or a QR renderer are available.
