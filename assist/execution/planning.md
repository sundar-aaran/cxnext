# Planning

Active reference: `#71`

## Active

- `#71` Split GST Statement summary into two cards
  - Goal:
    - Make the GST Statement lower summary content read as two clear cards.
  - Scope:
    - GST Statement frontend report summary layout only.
  - Constraints:
    - Keep Sales and Purchase side tables unchanged.
    - Preserve existing calculations and values.
    - Do not modify unrelated dirty worktree changes.
    - Keep the active reference aligned with the current changelog state `1.0.71`.
  - Planned validation:
    - Run focused frontend typecheck.
  - Implemented:
    - Combined GST Balance and Tax Split into one GST Summary card.
    - Kept Period Comparison as the second summary card with month and year mini tables side by side on wider screens.
    - Preserved Sales and Purchase side-table rendering and existing GST calculations.
    - Added a `v 1.0.71` changelog entry for the GST Statement two-card summary layout.
  - Validation:
    - Ran `corepack pnpm --filter @cxnext/frontend typecheck`.
  - Residual risk:
    - Existing unrelated working-tree changes remain untouched.
