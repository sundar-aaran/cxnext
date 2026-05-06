# Planning

Active reference: `#69`

## Active

- `#69` Move accounting years to common master
  - Goal:
    - Treat accounting years as shared common master records that can be referenced from default-company and future modules.
  - Scope:
    - Common master definitions/routes/serialization, accounting year schema and seed data, application-context reads, and frontend navigation/page usage.
  - Constraints:
    - Keep the existing `accounting_years` table as the single accounting-year table.
    - Remove tenant, industry, and company columns from accounting years.
    - Preserve default-company references through `default_companies.accounting_year_id`.
    - Avoid introducing cross-module shortcuts; common master owns accounting-year CRUD.
  - Planned validation:
    - Run `@cxnext/db`, `@cxnext/server`, and `@cxnext/frontend` typechecks.
  - Implemented:
    - Added Accounting Year as a common master module with `/common/accounting-years` CRUD and common sidebar metadata.
    - Extended common master records and request mapping with `name`, `startDate`, `endDate`, and `booksStart`.
    - Removed tenant, industry, company, and default flags from the `accounting_years` table definition; uniqueness now belongs to the shared `name`, `start_date`, and `end_date` fields.
    - Refactored company seeding so default companies reference a shared accounting-year row instead of company-owned accounting-year rows.
    - Removed the dedicated Accounting Year frontend page implementation and moved the menu route to `/desk/common/accountingYear`.
    - Removed accounting-year write endpoints/use cases from the application-context module; default-company reads shared accounting years through the common endpoint.
  - Validation:
    - Ran `corepack pnpm --filter @cxnext/db typecheck`.
    - Ran `corepack pnpm --filter @cxnext/server typecheck`.
    - Ran `corepack pnpm --filter @cxnext/frontend typecheck`.
  - Residual risk:
    - Existing databases need a refresh or manual migration because this batch changes the accounting-year table shape rather than adding a compatibility migration.
