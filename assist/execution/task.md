# Task

Active reference: `#69`

## Active

- [x] `#69` Move accounting years to common master
  - [x] Phase 1: common master model
    - [x] 1.1 Add accounting year to common master definitions, controllers, routes, and metadata.
    - [x] 1.2 Extend common master serialization for accounting year fields.
    - [x] 1.3 Refactor accounting year display field from `label` to `name`.
  - [x] Phase 2: database and seed refactor
    - [x] 2.1 Remove tenant, industry, and company ownership from the accounting years table.
    - [x] 2.2 Refactor company seeding to reuse shared accounting years.
    - [x] 2.3 Enforce shared accounting year uniqueness by `name`, `start_date`, and `end_date`.
  - [x] Phase 3: application context references
    - [x] 3.1 Point default-company/accounting-year references at the shared common accounting years.
    - [x] 3.2 Remove dedicated accounting-year write UI/API paths.
  - [x] Phase 4: validation
    - [x] 4.1 Run focused typechecks for DB, server, and frontend.
- [x] `#69` Refine company details and tax upsert tabs
  - [x] 1.1 Rename Identity tab to Details and arrange company identity fields into requested rows.
  - [x] 1.2 Reorder Tax Details fields into GST, MSME, TDS, TAN, and TCS rows.
  - [x] 1.3 Add TCS availability, section, and rate support across DB, server, seed data, and frontend.
- [x] `#69` Add company communication and shared address book
  - [x] 1.1 Rename Registration tab to Communication and add multi-row email, phone, and social-link cards.
  - [x] 1.2 Add shared `address_book` table with owner links and common location master id columns.
  - [x] 1.3 Move company/contact address persistence to `address_book` and add company Addressing tab.
  - [x] 1.4 Remove company Registration Number and place Date of incorporation under Tax Details.
