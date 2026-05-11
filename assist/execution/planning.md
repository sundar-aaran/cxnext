# Planning

Active reference: `#72`

## Active

- `#72` Refine admin and GST interface details
  - Goal:
    - Improve small-screen comfort and visual clarity for admin authorization forms and GST report totals.
  - Scope:
    - Frontend Auth admin user and permission module surfaces.
    - Frontend GST Statement total summary presentation and balance calculation.
    - Execution tracking and changelog documentation for the active `1.0.72` reference.
  - Constraints:
    - Preserve existing API contracts and auth bounded-context behavior.
    - Keep changes scoped to interface layout, visual treatment, and report calculation direction.
    - Do not overwrite unrelated dirty worktree changes.
    - Keep active execution reference aligned to package/changelog version `1.0.72`.
  - Planned validation:
    - Run focused frontend typecheck after the UI refinements.
  - Implemented:
    - Reduced Permission module popup height with compact inputs, shorter textarea, and independently scrolling policy list.
    - Converted User upsert to a single-column form and restyled the Active row in the same green enabled tone used elsewhere.
    - Split GST total summaries into padded full-width outer cards with bordered inner cells.
    - Added sign-based colours for GST balance/difference values: negative red, neutral gray, and positive green.
    - Corrected GST balance direction to `Opening GST + Purchase GST - Sales GST`.
  - Validation:
    - `pnpm --filter @cxnext/frontend typecheck`
  - Residual risk:
    - Visual fit should still be checked in-browser on the smallest target viewport because typecheck cannot verify exact modal comfort.
