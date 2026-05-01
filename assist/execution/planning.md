# Planning

Active reference: `#141`

## Active

- `#141` Remove Sales print reserve lines
  - Goal:
    - Restore Sales print filler behavior so `SAL-LINE-010` shows 20 content lines and 4 blank lines, with no reserve lines.
  - Scope:
    - Sales frontend print page line planning only.
  - Constraints:
    - Preserve PO/DC wrapping line counting.
    - Remove only the extra reserve mechanism.
    - Keep touched source files below the 700-line repository limit.
  - Planned validation:
    - Recalculate `SAL-LINE-005`, `SAL-LINE-010`, and `SAL-LINE-020`.
    - Run Prettier on touched files.
    - Run `pnpm --filter @cxnext/frontend typecheck`.
  - Implemented:
    - Removed the repeated PO/DC reserve from the Sales invoice item line planner.
    - Kept PO/DC wrapping as part of content-line counting.
    - Restored blank filler rows based only on content-line usage.
    - Added `sales-print-line-plan.ts` as the pure helper for item line counting and print grid planning.
    - Locked every Sales invoice to a fixed 27-line item grid after browser calibration.
    - Added the screen-only `Invoice print lines` diagnostic panel on Sales show pages.
    - Added focused `sales-print-line-plan` tests for PO/DC wrapping, long product names, simple invoices, and the `SAL-LINE-005` calibration case.
  - Validation:
    - Recalculated `SAL-LINE-005` as 5 content lines, 0 reserve lines, 19 blank lines, and 24 total budget lines.
    - Recalculated `SAL-LINE-010` as 20 content lines, 0 reserve lines, 4 blank lines, and 24 total budget lines.
    - Recalculated `SAL-LINE-020` as 40 content lines, 0 reserve lines, and overflow.
    - Ran Prettier on the touched Sales print page and execution files.
    - Ran `pnpm --filter @cxnext/frontend typecheck`.
    - Ran `vitest run tests/frontend/sales-print-line-plan.test.ts`.
    - Browser checked `/desk/sales/4`: line report shows `Budget: 27`, invoice renders, and no runtime error appears.
    - Ran `git diff --check` for touched files; only CRLF normalization warnings were reported.
    - Confirmed `sales-print-page.tsx` is 684 lines, below the 700-line repository limit.
  - Residual risk:
    - Keep `SAL-LINE-005` as the baseline reference when changing row heights, font sizes, or address/header sections; small visual changes can push the invoice to page two.

## Next Agent Handoff

- The correct current print-fit rule is fixed budget `27`; earlier notes about a 24-line budget are obsolete.
- Known-good line report for `SAL-LINE-005`: `Items: 7`, `Blank: 20`, `Budget: 27`, `Template: single-page`.
- Other invoices should fit by using fewer blank rows within the same 27-line budget, not by increasing the budget.
- The line helper counts wrapped printed lines from content, especially PO/DC at 6 characters per line and offset particulars at 32 characters per line.
