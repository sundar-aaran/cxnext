# Task

Active reference: `#141`

## Active

- [x] `#141` Remove Sales print reserve lines
  - [x] Phase 1: line budget
    - [x] Remove the repeated PO/DC reserve from Sales print line planning.
    - [x] Restore blank filler rows based on pure content-line count.
  - [x] Phase 2: validation
    - [x] Recalculate sample invoice item-area lines.
    - [x] Run formatter and frontend typecheck.
  - [x] Phase 3: fixed 27-line invoice calibration
    - [x] Lock Sales print item grid to a fixed 27-line budget for every invoice.
    - [x] Keep `SAL-LINE-005` as the reference case: 7 item lines, 20 blank lines, 27 budget.
    - [x] Keep the screen-only `Invoice print lines` diagnostic visible on Sales show pages.
    - [x] Validate the line-count helper with focused frontend tests.

## Notes For Next Agent

- Sales invoice print fitting is calibrated around a fixed `27` item-line budget in `apps/frontend/features/sales/interface/pages/sales-print-line-plan.ts`.
- `SAL-LINE-005` is the known-good visual reference: `Items: 7`, `Blank: 20`, `Budget: 27`, `Template: single-page`.
- Do not reintroduce adaptive budgets above 27; simple invoices must also stay inside the same 27-line page-fit ceiling.
- The `Invoice print lines` panel on Sales show pages is diagnostic and `print:hidden`; keep it until print fitting is fully signed off.
- PO/DC wrapping uses 6 characters per printed line. Offset particulars currently use 32 characters per line.
