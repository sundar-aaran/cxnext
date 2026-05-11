# Changelog

## Version State

- Current package version: `1.0.80`
- Current release tag: `v-1.0.80`
- Versioned changelog label format: `v 1.0.<reference>`
- Version section format: `## v-1.0.<reference>`
- Entry format: `### [v 1.0.<reference>] YYYY-MM-DD - Title`

## v-1.0.80

### [v 1.0.80] 2026-05-11 - Add Settings Apps Page

- Added a Settings > Apps menu entry and `/desk/settings/apps` route.
- Added a grouped app module catalog with icon cards, short descriptions, and enabled check states.
- Added local toggle persistence for the Apps card enabled state.
- Bumped workspace package manifests to `1.0.80`.

## v-1.0.79

### [v 1.0.79] 2026-05-11 - Limit Dashboard App Switcher

- Limited the dashboard breadcrumb app switcher to Dashboard, Ecommerce, Billing, Stock, Site, Task, Tally, and Crm.
- Removed hidden app switcher entries for Frappe, Demo, Core, API, CLI, and UI.
- Bumped workspace package manifests to `1.0.79`.

## v-1.0.78

### [v 1.0.78] 2026-05-11 - Fix Container Compose Update Execution

- Installed Docker Compose v2 in the app container image so in-app update builds can run from the deployed container.
- Updated setup CLI Docker actions to support both `docker compose` and `docker-compose`.
- Added a detached Docker helper path for in-container restart actions so the app can replace itself without killing the restart command.
- Updated the app compose bind mount to preserve the real host deploy source during helper-driven restarts.
- Validated local Docker E2E for compose config, image build, in-container system update preflight, build, restart, preserved bind mounts, and health check.

## v-1.0.77

### [v 1.0.77] 2026-05-11 - Bump Version For Update Validation

- Bumped workspace package manifests to `1.0.77`.
- Updated changelog Version State to release tag `v-1.0.77`.
- Refreshed execution tracking for the update validation batch.

## v-1.0.76

### [v 1.0.76] 2026-05-11 - Add Web Container Setup

- Added setup-mode container boot so the app can start when `.env` is missing.
- Added setup CLI commands for status, configure, pull, build, start, prepare-db, and deploy.
- Added public setup API endpoints connected to the CLI for first-run web installation.
- Added `/setup` frontend workflow with database and deployment configuration plus pull/build/start actions.
- Updated app-only container usage instructions and revalidated setup CLI, compose config, and focused typechecks.

## v-1.0.75

### [v 1.0.75] 2026-05-11 - Move Container Deployment Files

- Moved the app Dockerfile and Docker Compose file into `.container`.
- Aligned the app compose network with the existing MariaDB `codexion-network`.
- Updated MariaDB compose to expose `3307:3306` and create `cxnext_db` for fresh containers.
- Added `.container/usage.md` with build, start, database create/update/fresh, and system update instructions.
- Updated deploy scripts and updater CLI for `.container/docker-compose.yml`, then revalidated compose, typechecks, and Docker build.

## v-1.0.74

### [v 1.0.74] 2026-05-11 - Use External MariaDB For Docker Deployment

- Removed the bundled MySQL service and volume from the app Docker Compose file.
- Configured the app container to connect to an existing MariaDB container on the shared Docker network.
- Updated deployment environment defaults for `mariadb`, root credentials, and `cxnext_db`.
- Added deployment documentation for creating or attaching the MariaDB container and creating the database only when missing.
- Revalidated Docker Compose config plus focused server and frontend typechecks.

## v-1.0.73

### [v 1.0.73] 2026-05-11 - Add Docker Deployment And System Update

- Added Dockerfile, docker-compose, Docker ignore rules, deployment environment samples, and Ubuntu deployment documentation.
- Added a system update CLI for preflight, status, clone/pull sync, build, restart, and full deploy using `.env` `GIT_URL` and branch settings.
- Added protected server endpoints to run system update status and manual actions.
- Added Settings > System Update frontend page and side menu entry with preflight, sync, build, restart, and deploy controls.
- Added deployment keys to Core Settings and revalidated server/frontend typechecks plus local Docker image build.

## v-1.0.72

### [v 1.0.72] 2026-05-11 - Refine Admin And GST Interface Details

- Reduced the Permission module upsert popup height with compact fields and a scrollable policy checklist for smaller screens.
- Changed User upsert to a single-column form and matched the Active toggle row to the green enabled tone.
- Split GST Statement totals into full-width outer cards with bordered inner cells.
- Added sign-based GST total colouring for negative, neutral, and positive values.
- Corrected GST balance direction to `Opening GST + Purchase GST - Sales GST`.
- Revalidated the frontend workspace with focused typecheck.

### [v 1.0.72] 2026-05-11 - Refactor Permission And Policy Catalogs

- Refactored Policy into an action master with read, list, create, update, delete, and report actions.
- Refactored Permissions into module records that map selected policies to generated module-policy permission keys.
- Added auth policy action and permission module catalog tables with seed data synced from the shared RBAC catalog.
- Added popup CRUD APIs and Common-list-style UI flows for Policy and Permission module management.
- Replaced auth manage checks with update policy checks and revalidated shared types, db, server, and frontend typechecks.

### [v 1.0.72] 2026-05-11 - Simplify Role Master Workflow

- Slimmed seeded system roles to Super Admin, Admin, Manager, Operator, Viewer, Web Client, and Premium Client.
- Updated RBAC seeding to remove obsolete seeded roles and keep the default admin assigned to Super Admin.
- Reworked Roles admin into a Common-list-style page with popup create/edit and protected delete actions.
- Removed separate Role create/edit routes and kept role records independent from permission editing.
- Revalidated frontend, server, db, and shared types focused typechecks.

### [v 1.0.72] 2026-05-11 - Bump Workspace Version

- Bumped workspace package manifests and active changelog state to `1.0.72`.

## v-1.0.71

### [v 1.0.71] 2026-05-11 - Split Authorization Admin Surfaces

- Changed Roles into a standalone master workflow for role list, create, edit, and delete without assigning permissions from the role form.
- Grouped the Permissions admin page by module and kept Policy as the deeper permission definition/catalog view.
- Added a User show page with animated Role, Permission, and Policy tabs for user-specific access review.
- Simplified User upsert to user content only and linked user list/gate rows into the show page.
- Revalidated focused server and frontend typechecks.

### [v 1.0.71] 2026-05-11 - Add Admin Authorization Management

- Added role create/update endpoints, permission validation, policy catalog output, and effective user gate output inside the existing Auth bounded context.
- Published role access changes through the auth domain event publisher to keep the modular monolith event-driven.
- Added Admin side-menu entries and pages for Roles, Permissions, Policy, and Gate.
- Connected role management to the permission catalog and user access model, with focused server and frontend typechecks passing.

### [v 1.0.71] 2026-05-11 - Fix Dev Startup And Update Dependencies

- Fixed the dev launcher so Turbo `--filter` flags are consumed by Turbo instead of being forwarded into frontend, server, and desktop package scripts.
- Updated workspace dependencies and the package-manager pin to pnpm `11.0.9`, with pnpm build-script approvals recorded in the workspace config.
- Kept Kysely pinned to `0.28.16` because latest `0.29.0` requires an ESM migration for the current server/db package architecture.
- Increased the default dev readiness timeout for cold starts and verified the dev smoke test reaches `cxnext dev is ready`.
- Revalidated full workspace typecheck, server build, frontend typecheck, launcher syntax, and Turbo filter resolution.

### [v 1.0.71] 2026-05-11 - Speed Up Dev Server Startup

- Limited the default root `dev` launcher to frontend and server workspaces so server startup is not coupled to the desktop dev task.
- Added `dev:all` and launcher `--desktop`/`--all` support for the full frontend, server, and desktop development flow.
- Ran preflight and dev port release in parallel before starting Turbo to reduce avoidable sequential startup delay.
- Revalidated the dev launcher syntax, root package JSON, server typecheck, and Turbo filter resolution.

### [v 1.0.71] 2026-05-10 - Add Statement Contact Lookup Filters

- Moved Customer Statement and Supplier Statement party filters before the date filters.
- Replaced the free-text party filter with a no-create autocomplete lookup from the contact master.
- Filtered Customer Statement lookup options to active `contact-type:customer` contacts and Supplier Statement options to active `contact-type:supplier` contacts.
- Revalidated the frontend workspace with focused typecheck.

### [v 1.0.71] 2026-05-10 - Add Report Letterhead Printing

- Added company letterhead output for Customer Statement, Supplier Statement, and GST Statement printing.
- Loaded the primary company record for report print headers and kept a graceful fallback when no company is available.
- Moved report print components into a focused file and kept printed pages limited to the letterhead and report content.
- Revalidated the frontend workspace with focused typecheck.

### [v 1.0.71] 2026-05-10 - Split GST Statement Into Two Cards

- Split GST Statement content into two stacked cards: Sales/Purchase tables first, then GST Balance, Tax Split, and Period Comparison together.
- Preserved existing report values, calculations, and table content.
- Revalidated the frontend workspace with focused typecheck.

### [v 1.0.71] 2026-05-10 - Refine Sales Show Collaboration Placement

- Removed the comments, activity, and entry tools collaboration panel from the Sales create/edit upsert page.
- Kept the collaboration panel available on the Sales show page below the invoice document.
- Removed the remaining top Send to Email action from Sales upsert and show toolbars.

### [v 1.0.71] 2026-05-10 - Add Sales-Style Purchase Bill Print

- Reworked the Purchase show page to use the same print toolbar, copy selection, document layout, and collaboration placement as Sales.
- Added Supplier No and Reference Date details to the Purchase bill print header.
- Wired Purchase row print and Save & Print to the show-page print flow.

### [v 1.0.71] 2026-05-10 - Align Purchase Upsert With Sales Tone

- Reworked the Purchase create/edit page into the same full-width tabbed upsert shell used by Sales.
- Added Details, Address, and Terms tabs with compact labelled inputs.
- Replaced stacked purchase item cards with a dense invoice-style item table, Add row action, and inline totals.

### [v 1.0.71] 2026-05-10 - Align Payment And Receipt Entry Screens

- Refactored Payment and Receipt upsert pages into the same full-width tabbed shell and two-column Details layout used by Sales.
- Moved Payment and Receipt save controls into the shared footer action band.
- Replaced the Receipt show summary card with a Sales-style printable receipt voucher, toolbar navigation, and entry collaboration panel.

### [v 1.0.71] 2026-05-10 - Add Reports Menu And Statement Pages

- Added a Reports side-menu group with Customer Statement, Supplier Statement, and GST Statement pages.
- Added top filter bars for date range and party search across the new reports.
- Added print-ready report sheets with totals and a Print action for each statement page.

### [v 1.0.71] 2026-05-10 - Seed Entry Data And Refine Statements

- Expanded the entry seeder to create about 18 Sales, Purchase, Payment, and Receipt records each.
- Reworked Customer Statement to combine Sales and Receipts with running balance and record age.
- Reworked Supplier Statement to combine Purchases and Payments with running balance and record age.
- Reworked GST Statement into separate Sales and Purchase tables with bottom card-style taxable and GST summaries.
- Added opening GST calculation from prior filtered records and closing GST to the GST Statement totals area.
- Added a Months common master with seeded 2026 month ranges and connected GST Statement filtering to the selected month.
- Replaced GST Statement total tiles with balance, tax split, and month/year comparison summary cards.
- Added Duties & Taxes settings for opening GST split with as-on date and connected GST Statement opening balances to it.
- Restyled GST Statement summaries as full-width sections with small nested metric cards.
- Tightened GST Statement total sections with clean cell borders and table-like value alignment.
- Corrected GST Statement balance calculation to Opening GST plus Purchase GST minus Sales GST.

## v-1.0.70

### [v 1.0.70] 2026-05-08 - Hide Empty Sales Barcode Divider

- Removed the Sales print header divider beside the company details when e-invoice barcode data is unavailable.
- Preserved the divider when both IRN and signed QR data are present.
- Revalidated the frontend workspace with focused typecheck.

### [v 1.0.70] 2026-05-08 - Add Sales Print Copy Option

- Added Original, Duplicate, and Triplicate copy options to the Sales print page toolbar.
- Updated the Sales invoice print header to render the selected copy label, defaulting to Original Copy.
- Revalidated the frontend workspace with focused typecheck.

### [v 1.0.70] 2026-05-08 - Move Sales Print Totals Right

- Moved the Sales invoice print totals summary block to the right edge of the item table using dynamic print-column spans.
- Restored summary label text alignment inside the totals block while keeping values right-aligned.
- Printed invoice-specific Terms content when provided and fell back to default terms when the invoice terms are empty.
- Revalidated the frontend workspace with focused typecheck.

### [v 1.0.70] 2026-05-08 - Tighten Sales Print Blank Rows

- Reduced the Sales invoice item print budget by two rows so generated blank item lines are shorter.
- Removed the e-invoice QR/barcode bordered block when IRN data is not available.
- Revalidated the frontend workspace with focused typecheck.

### [v 1.0.70] 2026-05-08 - Finalise Sales Invoice Print Data

- Connected the Sales print document to the loaded primary company data while preserving the saved Sales record as the invoice source.
- Removed hardcoded company, party, tax, e-invoice, e-way, QR, address, and bank placeholders from the active print template; unavailable data now renders blank.
- Removed the visible print line diagnostic panel from the final Sales print page.
- Revalidated the frontend workspace with focused typecheck.

### [v 1.0.70] 2026-05-08 - Auto-Fill Next Sales Invoice Number

- Updated new Sales invoice creation to scan existing Sales invoice numbers and fill the next matching number from the configured invoice prefix and serial start.
- Preserved saved invoice numbers while editing and avoided overwriting a number typed manually before the async lookup completes.
- Revalidated the frontend workspace with focused typecheck.

### [v 1.0.70] 2026-05-08 - Align Sales Invoice Identifier Fields

- Left-aligned the Sales Details Invoice no and Order no input text so identifiers begin at the field start.
- Preserved existing Date, totals, and other numeric field alignment.
- Revalidated the frontend workspace with focused typecheck.

### [v 1.0.70] 2026-05-08 - Refresh Assist Execution Log

- Read the assist guide, agent contract, and task-relevant execution, release, branch, generation, and coding rules.
- Refreshed the active execution task and planning logs for reference `#70`.
- Recorded the batch as documentation-only and left unrelated working-tree changes untouched.

### [v 1.0.70] 2026-05-07 - Standardize Master Autocomplete Lookup

- Added shared `MasterAutocompleteLookup` as the reference control for upcoming common/master autocomplete fields.
- Captured the expected lookup behavior in the component and execution notes: type search, arrow navigation, Enter selection/create, Escape cancel, selected check mark, default id `1` shown as `-`, and optional quick create for common modules.
- Wired Sales quick product HSN Code, Unit, and GST Percent fields to the shared reference component.
- Revalidated the frontend workspace with focused typecheck.

### [v 1.0.69] 2026-05-06 - Consolidate Core Settings And Runtime Env

- Added the Settings sidebar group with Core Settings, Customise, and Features pages.
- Added a protected Core Settings API for reading and updating the repository root `.env` from the frontend.
- Grouped Core Settings with animated tabs for Application, Frontend, Backend, Database, Security, Notifications, Payments, Env Policy, and `.env` reference.
- Consolidated `.env` to minimal source values and derived duplicate runtime values at startup: `NODE_ENV`, `PORT`, `FRONTEND_URL`, `BACKEND_URL`, `BACKEND_HEALTH_URL`, and `NEXT_PUBLIC_API_URL`.
- Removed duplicate `.env.example`, kept `.env.sample` as the single concise reference, and updated preflight guidance to point to `.env.sample`.
- Replaced `FRONTEND_TARGET` with `APP_TYPE=shop` and added `APP_CLIENT=100`.
- Added server enum-backed select options for `APP_TYPE` and `APP_CLIENT`, including `100 - Developer Edition`, and connected them to Core Settings saves.
- Added an Env Policy view that marks managed, excluded, and review-needed env keys; excluded keys are removed when Core Settings saves.
- Updated server, frontend, desktop, and dev/start scripts to derive URLs from `APP_HOST` and port values.
- Persisted dashboard side-menu open groups in local storage so expanded groups survive page navigation while still loading compact initially.
- Upgraded the pinned package manager from `pnpm@10.33.2` to `pnpm@10.33.3`.
- Revalidated the affected UI, frontend, server, desktop, and types workspaces with focused typechecks/builds.

### [v 1.0.69] 2026-05-03 - Move Accounting Years To Common Master

- Moved Accounting Year into the common master flow with `/common/accounting-years` CRUD and `/desk/common/accountingYear` navigation.
- Removed tenant, industry, company, and default ownership columns from `accounting_years`; the shared period is now unique by name, start date, and end date.
- Extended common master serialization and forms for accounting-year fields: name, start date, end date, and books start.
- Refactored company seeding and default-company selection to reference shared accounting-year rows.
- Removed the dedicated accounting-year application-context write path and standalone frontend list page.
- Revalidated the affected DB, server, and frontend workspaces with focused typechecks.

### [v 1.0.69] 2026-05-03 - Refine Company Tax Details Form

- Renamed the company upsert identity tab to Details and arranged the opening fields into cleaner two-column rows.
- Reworked the Tax Details tab into grouped GST, MSME, TDS, TAN, and TCS rows.
- Added company TCS availability, section, and rate fields through the schema, API, GraphQL model, repository, seed data, and frontend form.

### [v 1.0.69] 2026-05-03 - Add Company Communication And Address Book

- Renamed the company upsert Registration tab to Communication and added card-based multiple email, phone, and social-link sections with Add/Remove controls.
- Added a global `address_book` table keyed by owner type and owner id, replacing separate company/contact address storage and carrying common location master ids for country, state, district, city, and pincode.
- Wired company and contact address persistence to the shared address book and added an Addressing tab for company address-book rows.
- Removed company Registration Number and moved Date of incorporation into the Tax Details tab after MSME Category.

### [v 1.0.69] 2026-05-02 - Stabilize Auth Env And Frontend Runtime

- Standardized runtime configuration around the root `.env`, keeping database and app URLs sourced from the shared `DB_*`, `FRONTEND_URL`, `BACKEND_URL`, and `NEXT_PUBLIC_API_URL` variables.
- Refreshed `codexsun_db` from the current migrations and seeders so auth, RBAC, and supporting master data match the live codebase again.
- Replaced the deprecated Next.js middleware convention with `proxy.ts` and removed the related frontend warning.
- Fixed frontend Next.js build and runtime env loading so `NEXT_PUBLIC_API_URL` reaches the client bundle during build/start, restoring login and auth-protected desk flows.
- Revalidated the live app with frontend typecheck/build, API health, and the auth smoke e2e covering login, guarded routes, and both logout paths.

### [v 1.0.69] 2026-05-01 - Calibrate Sales Invoice Print Lines

- Added a pure Sales print line-planning helper with PO/DC wrapping, particulars counting, and focused tests.
- Locked Sales invoice item grids to the calibrated 27-line page-fit budget.
- Added a screen-only Sales show diagnostic panel that reports item lines, blank lines, budget, and template status.
- Captured `SAL-LINE-005` as the reference fit case: 7 item lines and 20 blank lines.

### [v 1.0.69] 2026-04-30 - Refine Sales Invoice Print Layout

- Reworked the Sales print invoice header with a centered top `TAX INVOICE` label, right-aligned original-copy marker, and larger portal-style QR area.
- Combined bill details and e-invoice IRN/Ack details into a compact bordered information band above the buyer/ship-to party area.
- Improved invoice detail readability with aligned label/value columns, wider invoice/date/reference values, larger IRN/Ack text, and hyphenated invoice dates.

### [v 1.0.69] 2026-04-30 - Implement Entries Basic Billing Modules

- Added the `entries` backend bounded context with DDD layers, Kysely persistence, HTTP endpoints, GraphQL placeholders, migrations, seeders, and create/update/delete domain events.
- Added `sales`, `sales_items`, `purchases`, `purchase_items`, `payments`, `payment_allocations`, `receipts`, and `receipt_allocations` tables with seed data.
- Added separate modular frontend features and `/desk` routes for Sales, Purchase, Payment, and Receipt list/show/upsert flows.
- Added the desk sidebar `Entries` group while preserving locked `Organisation`, `Master`, and `Common` behavior.
- Added focused Entries event and architecture boundary coverage, plus migration and seed validation.

## v-1.0.68

### [v 1.0.68] 2026-04-30 - Add Contact And Product Upsert Tabs

- Updated Contact upsert to use Company-style animated grouped tabs for Details, Communication, and Addresses.
- Updated Product upsert to use Company-style animated grouped tabs for Details, Catalogue, Media, and Tags.
- Preserved existing upsert save, load, cancel, and route behavior while aligning the form shell with `MasterListUpsertCard`.

## v-1.0.67

### [v 1.0.67] 2026-04-30 - Build Product List Show Upsert Module

- Added the `products` backend bounded context with domain records, value objects, create/update/delete events, application use cases, Kysely persistence, HTTP controller, GraphQL read placeholder, migration, and seeder.
- Added product slug and SEO helper use cases and HTTP endpoints.
- Added the `product` frontend feature with domain/form models, API adapter, list/show/upsert services, route-facing pages, and `/desk/product` routes.
- Added Product to the desk sidebar `Master` group beside Contact while preserving the locked Organisation accordion.
- Added focused product event and boundary coverage, and extended final boundary enforcement to include product backend and frontend module shapes.
- Verified product list/show/create and slug helper e2e on the local dev stack.

## v-1.0.66

### [v 1.0.66] 2026-04-30 - Build Contact List Show Upsert Module

- Added the `contacts` backend bounded context with domain records, value objects, create/update/delete events, application use cases, Kysely persistence, HTTP controller, GraphQL read placeholder, migration, and seeder.
- Added the `contact` frontend feature with domain/form models, API adapter, list/show/upsert services, route-facing pages, and `/desk/contact` routes.
- Added a new desk sidebar `Master` group and placed Contact under it while preserving the locked Organisation accordion.
- Added focused contact event and boundary coverage, and extended final boundary enforcement to include the contact backend and frontend module shapes.
- Verified contact list/show/create/update/search e2e on the local dev stack and fixed runtime GraphQL nullable string metadata plus aborted fetch cleanup discovered during smoke testing.

## v-1.0.65

### [v 1.0.65] 2026-04-30 - Add Final Boundary Enforcement Suite

- Added final architecture coverage for strict backend/frontend module folders, adapter placement, public entrypoint size, and generated source artifacts.
- Moved tenant frontend API calls into module-local infrastructure to complete the strict frontend boundary set.
- Ran server, frontend, and UI typechecks plus full package lint and consolidated architecture validation.

## v-1.0.64

### [v 1.0.64] 2026-04-30 - Add Route And Module Boundary Checks

- Added architecture coverage that keeps backend HTTP controllers from directly injecting repositories.
- Added frontend route boundary checks that prevent app routes from importing feature infrastructure or implementation root files.
- Ran server/frontend typechecks and the consolidated boundary validation suite.

## v-1.0.63

### [v 1.0.63] 2026-04-30 - Split Frontend Page Entrypoints

- Reduced tenant, company, and industry public page entrypoints to small route-facing export files.
- Moved existing page implementations behind stable module-local root files without changing route imports.
- Added architecture coverage for public feature page entrypoint size and export stability.

## v-1.0.62

### [v 1.0.62] 2026-04-30 - Split Dashboard Shell Public Boundary

- Reduced the public `dashboard-shell.tsx` entrypoint to a small stable export boundary.
- Moved the existing dashboard shell implementation behind the public entrypoint without changing package exports.
- Added architecture coverage for the public dashboard shell boundary.

## v-1.0.61

### [v 1.0.61] 2026-04-30 - Refactor Desk And Cxsun Frontend Boundaries

- Moved desk registry, shell, and breadcrumb files into strict application/interface feature folders.
- Moved cxsun data, mappers, and pages into domain/application/interface folders.
- Updated app route imports and added architecture coverage that prevents the old flat feature entry files from returning.

## v-1.0.60

### [v 1.0.60] 2026-04-30 - Refactor Frontend Common Location Boundaries

- Split common list page helper logic into a module-local helper file while preserving the public page export.
- Moved common location HTTP and reference enrichment adapters into `common/location/infrastructure`.
- Added architecture coverage for the nested common location frontend boundary.

## v-1.0.59

### [v 1.0.59] 2026-04-30 - Refactor Frontend Feature Module Shells

- Added strict frontend `domain/application/infrastructure/interface/pages` shells for common, company, and industry.
- Moved common, company, and industry HTTP fetch adapters into module-local infrastructure files while preserving application service imports.
- Added architecture coverage that keeps frontend API/browser adapters out of application services.

## v-1.0.58

### [v 1.0.58] 2026-04-30 - Harden Backend Domain Models

- Added concrete company and industry domain entities, aggregates, value objects, and create/update/delete domain events.
- Routed company and industry write use cases through module-local domain event publishers after persistence succeeds.
- Added focused event publication and backend domain import-boundary coverage.

## v-1.0.57

### [v 1.0.57] 2026-04-30 - Refactor Remaining Common Master Boundaries

- Moved HSN codes, taxes, warehouses, transports, destinations, order types, stock rejection types, currencies, and payment terms behind the shared common master use cases, repository port, and infrastructure providers.
- Extended common master definitions and persistence mapping for compliance, warehouse address, currency decimal, and payment due-day fields.
- Removed direct repository injection from the remaining common master controllers and added focused boundary and event coverage.

## v-1.0.54

### [v 1.0.54] 2026-04-30 - Refactor Common Product Attribute Boundaries

- Moved brands, colours, sizes, styles, and units behind the shared common master use cases, repository port, and infrastructure providers.
- Extended common master definitions and persistence mapping for colour hex codes, size sort order, and unit symbols.
- Removed direct repository injection from product attribute controllers and added focused boundary and event coverage.

## v-1.0.53

### [v 1.0.53] 2026-04-30 - Refactor Common Product Taxonomy Boundaries

- Moved product groups, product categories, and product types behind the shared common master use cases, repository port, and infrastructure providers.
- Extended common master definitions and persistence mapping for product category storefront fields.
- Removed direct repository injection from product taxonomy controllers and added focused boundary and event coverage.

## v-1.0.52

### [v 1.0.52] 2026-04-30 - Refactor Common Contact Master Boundaries

- Moved contact groups, contact types, address types, and bank names behind common master use cases, repository ports, and infrastructure providers.
- Added common master domain records, definitions, and create/update/delete events with event-bus publication after successful writes.
- Removed direct repository injection from contact master controllers and added focused boundary and event publication tests.

## v-1.0.51

### [v 1.0.51] 2026-04-30 - Plan Remaining Boundary Refactors

- Cleared completed execution notes from the active task and planning files.
- Reviewed remaining backend common master, frontend feature, and oversized UI/page boundary work.
- Added a complete upcoming roadmap from common master refactors through final boundary enforcement.

## v-1.0.50

### [v 1.0.50] 2026-04-30 - Refactor Common Location Boundaries

- Moved common location definitions, records, and write events into the common domain layer.
- Routed countries, states, districts, cities, and pincodes HTTP flows through common location application use cases.
- Moved common location Kysely persistence and event-bus publication behind application ports, with focused boundary and event coverage.

## v-1.0.49

### [v 1.0.49] 2026-04-30 - Refactor Companies Module Boundaries

- Registered the companies bounded context through the module registry.
- Routed companies HTTP writes through application use cases instead of direct repository access from controllers.
- Added companies GraphQL read interface, module-local database migration/seeder exports, and focused architecture coverage for the strict backend module shape.

## v-1.0.48

### [v 1.0.48] 2026-04-30 - Refactor Common Module Boundary Shell

- Registered the common bounded context through the module registry.
- Added strict root module folder surfaces for common domain, application, infrastructure, interface, and database ownership.
- Added module-local common migration and seeder re-exports plus focused boundary coverage for the common shell.

## v-1.0.47

### [v 1.0.47] 2026-04-30 - Refactor Industries Module Boundaries

- Registered the industries bounded context through the module registry.
- Routed industries HTTP writes through application use cases instead of direct repository access from controllers.
- Added industries GraphQL read interface, module-local database migration/seeder exports, and focused architecture coverage for the strict backend module shape.

## v-1.0.46

### [v 1.0.46] 2026-04-29 - Refactor Company Read Boundaries

- Removed direct tenant and industry joins from company persistence.
- Added company-owned application ports and Kysely lookup adapters for tenant and industry display names.
- Added boundary coverage to prevent company persistence from reintroducing tenant or industry joins.

## v-1.0.45

### [v 1.0.45] 2026-04-29 - Refactor Tenant Write Boundaries And Events

- Added tenant create, update, and delete application use cases so HTTP writes no longer inject repositories directly.
- Added a tenant domain-event publisher port with an event-bus adapter and published `tenants.tenant-created` after successful tenant creation.
- Added focused coverage for tenant creation event publication.

## v-1.0.44

### [v 1.0.44] 2026-04-29 - Review Architecture Readiness

- Reviewed the current MVP architecture against the modular monolith, DDD, event-driven, and NestJS structure rules.
- Refreshed execution tracking with a clean active review batch.
- Documented remaining scalability risks around strict module shape, cross-module persistence joins, domain event publication, boundary validation, and oversized UI files.

## v-1.0.43

### [v 1.0.43] 2026-04-29 - Fix Common Masters And Sidebar Accordion

- Fixed common database refresh seed issues for tax defaults and shared row fields.
- Reordered location seeds so India is the first country and Tamil Nadu is the first state, with the state hyphen placeholder second.
- Updated common master lists to show foreign-key display names, expose status filters and column controls, and keep common sidebar subgroups collapsed around the active selection.

## v-1.0.42

### [v 1.0.42] 2026-04-29 - Fix Database CLI Environment Resolution

- Added ancestor `.env` discovery for `@cxnext/db` so package-level CLI commands can read repository-root database settings.
- Replaced raw MySQL access-denied stack traces with actionable credential guidance that avoids exposing secret values.
- Added focused tests for db env resolution and credential-error messaging.

## v-1.0.41

### [v 1.0.41] 2026-04-29 - Remove Deprecated TypeScript baseUrl Usage

- Removed deprecated `baseUrl` settings from the affected TypeScript configs and converted workspace path mappings to explicit relative targets.
- Updated the server TypeScript config to consume `@cxnext/db` declarations from the built package boundary instead of compiling workspace source directly.
- Prevented the Nest server build from regenerating JavaScript artifacts under `packages/db/src`.

## v-1.0.40

### [v 1.0.40] 2026-04-29 - Guard Build Artifacts From Source Trees

- Updated build-output guidance to match the repository's current `dist`, `.next`, and `out` tooling conventions.
- Added a repository rule that compiled JavaScript and declaration outputs must not appear inside `src/` trees.
- Added architecture coverage that fails when generated `.js`, `.js.map`, `.d.ts`, or `.d.ts.map` files exist under app or package source directories.

## v-1.0.39

### [v 1.0.39] 2026-04-29 - Add Database Refresh Command

- Added a guarded `db:refresh` / `db:fresh` workflow that drops database views and tables, then reruns migrations and seeders.
- Required explicit `--yes` confirmation in the CLI before destructive refresh runs.
- Added e2e coverage for the refresh confirmation guard.

## v-1.0.38

### [v 1.0.38] 2026-04-29 - Add Database Migration And Seeder Runner

- Added typed migration, seeder, registry, ledger, and runner support to `@cxnext/db`.
- Converted tenant database setup to TypeScript migration and seeder definitions with server module re-exports.
- Added `db:prepare`, `db:migrate`, `db:seed`, and `db:status` scripts plus e2e coverage for idempotent migrate/seed behavior.

## v-1.0.37

### [v 1.0.37] 2026-04-29 - Tighten Master List Search Card Padding

- Reduced the shared list toolbar card padding around search, filters, and columns controls.
- Preserved input and button sizing so the master-list toolbar remains stable across breakpoints.

## v-1.0.36

### [v 1.0.36] 2026-04-29 - Brighten Desk Surface Tone

- Reduced dark primary mixing in the light-mode desk surface tokens.
- Softened the shell spotlight so the workspace reads brighter while keeping the restrained desk tone.
- Preserved dark mode, accent palettes, layout, and list structure.

## v-1.0.35

### [v 1.0.35] 2026-04-29 - Lock Organisation Sidebar Accordion

- Locked the desk sidebar rule that `Overview` remains a standalone top-level row without a chevron.
- Locked `Organisation` as an accordion parent for Tenant, Industry, and Company, with active highlight only on the selected child row.
- Preserved the smooth accordion animation and plain unboxed sidebar icons as the required sidebar behavior.

## v-1.0.34

### [v 1.0.34] 2026-04-29 - Enforce Strict Tenant Module Structure

- Added a backend `tenants` bounded context under `apps/server/src/modules/tenants` with DDD layers plus `database/migrations` and `database/seeder`.
- Registered the backend tenant module in the Nest application and module registry.
- Refactored the frontend tenant feature into strict `domain`, `application`, `infrastructure`, and `interface/pages` folders.
- Added strict repository rules requiring this backend and frontend module structure for future bounded contexts.

## v-1.0.33

### [v 1.0.33] 2026-04-29 - Add Reusable List Blocks And Match Master List UI

- Added reusable `master-list`, `common-list`, and `entry-form` blocks under `@cxnext/ui`.
- Added shared list toolbar, filter, column visibility, table card, detail/form card, and pagination surfaces.
- Refit the tenant list, show, and upsert screens to the new shared list blocks with screenshot-matched transparent headers and split control/table/pagination cards.

## v-1.0.32

### [v 1.0.32] 2026-04-29 - Add Tenant Master Screens

- Added Tenant as the first Organisation master module with list, show, create, and edit routes.
- Added a `tenants` table-shaped frontend model with integer auto ids, slug, active status, timestamps, and soft delete.
- Added the Kysely `tenants` table contract to the shared database schema.
- Built the upsert workflow with TanStack Form and wired the Organisation sidebar Tenant row to `/desk/tenant`.

## v-1.0.31

### [v 1.0.31] 2026-04-29 - Replace Sidebar Menu With Organisation

- Removed the old utility side menu rows.
- Added an Organisation section with Tenant, Industry, and Company menu items.
- Added boxed icon logos for the remaining side menu rows while preserving collapsed tooltips.

## v-1.0.30

### [v 1.0.30] 2026-04-29 - Make Overview Sidebar Item Final

- Kept Overview linked directly to the `/desk` overview page.
- Removed the chevron from the Overview side menu item.
- Preserved chevrons for the rest of the side menu rows.

## v-1.0.29

### [v 1.0.29] 2026-04-29 - Simplify Sidebar Rows

- Added Overview as the first side menu item.
- Removed visible helper descriptions from expanded sidebar rows.
- Kept helper text available in collapsed icon tooltips and accessibility labels.

## v-1.0.28

### [v 1.0.28] 2026-04-29 - Show Frontend URL During Dev

- Added a root dev startup banner that prints the frontend, server, and health URLs before Turbo starts.
- Repeated the frontend URL from the Next wrapper after startup begins so it stays visible beside later Next logs.
- Kept the existing frontend port and dev process behavior unchanged.

## v-1.0.27

### [v 1.0.27] 2026-04-29 - Fix Helper Documentation Paths

- Updated the GitHub helper changelog reader to use `assist/documentation/CHANGELOG.md`.
- Updated helper usage text and assist rules to reference moved documentation paths.
- Preserved moved `assist/documentation/ARCHITECTURE.md` and execution tracking paths.

## v-1.0.26

### [v 1.0.26] 2026-04-29 - Add Sidebar Team Switcher

- Replaced the expanded sidebar brand header with a shadcn-style current team switcher.
- Added Teams dropdown rows with icons, shortcut labels, and an Add team action.
- Kept collapsed and mobile sidebar behavior intact while preserving access to the team menu.

## v-1.0.25

### [v 1.0.25] 2026-04-29 - Add Collapsed Sidebar Tooltips

- Added a shared tooltip provider around the dashboard shell.
- Added right-side label/helper tooltips for side menu icons when the desktop sidebar is collapsed.
- Preserved expanded sidebar labels and mobile drawer behavior.

## v-1.0.24

### [v 1.0.24] 2026-04-29 - Apply Theme Orientation To Full Page

- Replaced hardcoded dashboard shell page backgrounds with the shared theme shell surface.
- Added document-level light/dark `color-scheme` support for the existing Light, Dark, and System modes.
- Made body and scrollbar colors follow the active theme tokens across the full page.

## v-1.0.23

### [v 1.0.23] 2026-04-29 - Smooth Mobile Menu And Pointer Controls

- Added smoother transform/opacity timing for the mobile sidebar drawer and overlay.
- Tuned desktop sidebar expand/collapse transitions for header, rows, labels, footer, and grid movement.
- Standardized pointer cursors across topbar buttons, app switch rows, sidebar header/items, notification rows, and user navigation.

## v-1.0.22

### [v 1.0.22] 2026-04-28 - Fix Theme Accents And Real Sidebar Version

- Wired the sidebar version label to the root workspace package version instead of a stale literal.
- Copied the temp orange, blue, green, purple, and neutral accent token sets into the active frontend globals.
- Added dark-mode accent token overrides so the Appearance and Accent selector updates the shell consistently.

## v-1.0.21

### [v 1.0.21] 2026-04-28 - Polish Sidebar Logo And Header Buttons

- Removed the sidebar logo outer border/background and enlarged the logo mark.
- Changed sidebar toggles and header controls to medium rounded corners with compact icons.
- Made the notification count badge a fixed-size full circle.

## v-1.0.20

### [v 1.0.20] 2026-04-28 - Smooth Sidebar Expand Collapse

- Added smooth grid-column and sidebar surface transitions for desktop expand/collapse.
- Added label fade/slide transitions and eased padding/gap changes for sidebar rows.
- Preserved mobile drawer behavior while improving desktop side menu motion.

## v-1.0.19

### [v 1.0.19] 2026-04-28 - Reinstall Mobile Sidebar As Left Drawer

- Ran `npx shadcn@latest add sidebar-07 --yes` to pull the sidebar drawer baseline and dependencies.
- Removed the fixed mobile side rail and made the header menu button open a left drawer on mobile.
- Preserved the current desktop side menu expand/collapse behavior and reused the same menu content in the drawer.

## v-1.0.18

### [v 1.0.18] 2026-04-28 - Make Desk Responsive Across Breakpoints

- Kept the side menu as an icon rail on mobile and tablet while preserving desktop expand/collapse behavior.
- Added responsive header controls so app switch, title, notifications, home, theme, and logout fit smaller screens.
- Tuned Application Desk width, spacing, card padding, and application grid breakpoints from mobile through large desktop.

## v-1.0.17

### [v 1.0.17] 2026-04-28 - Match 90 Percent Desk Workspace Width

- Updated the Application Desk wrapper to use 90% of the available workspace.
- Removed extra outer horizontal padding so the remaining workspace gutter is 5% on each side.

## v-1.0.16

### [v 1.0.16] 2026-04-28 - Standardize Desk Width And Slim Scrollbars

- Set the Application Desk workspace container to the standard 9/12 width on wide screens.
- Added reusable slim scrollbar styling for shell scroll surfaces.
- Applied slim scrolling to the side navigation and inner workspace content.

## v-1.0.15

### [v 1.0.15] 2026-04-28 - Match Temp Theme Selector

- Matched the temp theme selector with Appearance and Accent sections.
- Added selected-state check icons, rounded menu styling, and persisted theme/accent choices.
- Kept the existing desk header layout while making the theme trigger use the active light/dark icon.

## v-1.0.14

### [v 1.0.14] 2026-04-28 - Match Desk Header Dropdowns And Fixed Rail

- Added the temp-style Application app switch dropdown with app icons and Dashboard entry.
- Added notification, theme, home, and user dropdown interactions to the desk header and footer.
- Made the side menu/footer fixed while the inner workspace content scrolls independently.

## v-1.0.13

### [v 1.0.13] 2026-04-28 - Add Application Desk Sidebar Toggle

- Wired the Application Desk header menu button to collapse and expand the left sidebar.
- Kept the expanded temp-matched sidebar layout while adding a compact icon rail state.
- Preserved desk routing and content while allowing the main workspace to expand when collapsed.

## v-1.0.12

### [v 1.0.12] 2026-04-28 - Match Temp Application Desk

- Updated `/desk` to render the root Application Desk instead of redirecting into the Cxsun workspace.
- Matched the temp dashboard sidebar, top header, admin hero panel, quick actions, and application card grid more closely.
- Kept the Cxsun Base starter app available under `/desk/cxsun`.

## v-1.0.11

### [v 1.0.11] 2026-04-28 - Add Cxsun Base Starter Workspace

- Added the `Cxsun Base` starting app workspace to the existing desk navigation.
- Added overview, master list, create/edit form, record detail, and operational queue screens.
- Kept sample workspace data, mapping helpers, and presentation views separated while reusing the shared design-system shell and components.

## v-1.0.10

### [v 1.0.10] 2026-04-28 - Align Electron And Frontend Dashboard Shell With Temp Theme

- Removed the default Electron application menu bar from the desktop window.
- Applied the temp dashboard shell theme to the current frontend desk sidebar, header, and dashboard surfaces.
- Refined the desk application dashboard with temp-style mesh panels, app collection cards, quick actions, and framework service cards.

## v-1.0.9

### [v 1.0.9] 2026-04-28 - Fix Frontend Hydration Warning And Startup URL Log

- Suppressed root body hydration warnings caused by browser extensions injecting attributes before React hydration.
- Added a frontend startup wrapper that prints `cxnext frontend listening on http://localhost:3000`.
- Kept the existing Next.js dev and start port behavior intact.

## v-1.0.8

### [v 1.0.8] 2026-04-28 - Add Strict Execution Tracking Rules

- Added mandatory execution tracking rules requiring `assist/execution/task.md` and `assist/execution/planning.md` before meaningful work starts.
- Linked the execution tracking rule from the assist guide, agent contract, code generation rules, and commit discipline.
- Reset active execution tracking to a clean `cxnext` batch instead of imported sample history.

## v-1.0.7

### [v 1.0.7] 2026-04-28 - Add Graceful Dev Server Controls

- Added root start, stop, dev restart, and port release scripts for frontend and backend processes.
- Added graceful backend shutdown hooks and Electron readiness checks for frontend and backend health.
- Verified development and production startup flows and measured initial page load performance.

## v-1.0.6

### [v 1.0.6] 2026-04-28 - Add Portal Desk Registry

- Added customer, vendor, admin, and super-admin desk entries through a frontend portal registry.
- Added an app selector dropdown in the desk breadcrumb and isolated side menu entries per portal.
- Added TanStack Form and Zod validation wiring to the auth form shells.

## v-1.0.5

### [v 1.0.5] 2026-04-28 - Add Frontend Layouts And Desk Dashboard

- Added shared UI package Tailwind sources, shadcn primitives, and a reusable dashboard shell.
- Added public web, auth, and app route-group layouts with sample home, about, contact, login, register, password reset, and desk pages.
- Wired the `desk` workspace dashboard to the application shell and documented the current shadcn registry mismatch for `dashboard-07`.

## v-1.0.4

### [v 1.0.4] 2026-04-28 - Add GitHub Helper CLI

- Added `apps/cli` with a GitHub helper workflow for pull/merge, changelog-based commit, and push.
- Added `github` and `github:now` package scripts.
- Wired version sync and tests to include the CLI helper.

## v-1.0.3

### [v 1.0.3] 2026-04-28 - Update Workspace Dependencies

- Updated direct workspace dependencies to latest available npm versions.
- Refreshed the lockfile after dependency upgrades.
- Ran build validation and repaired upgrade-related foundation issues.

## v-1.0.2

### [v 1.0.2] 2026-04-28 - Approve Package Build Scripts

- Upgraded the pinned package manager to `pnpm@10.33.2` so `pnpm approve-builds` is available.
- Added explicit `onlyBuiltDependencies` approvals for expected install-script packages.
- Kept dependency build-script approval centralized in `pnpm-workspace.yaml`.

## v-1.0.1

### [v 1.0.1] 2026-04-28 - Patch Kysely Security Advisory

- Updated `kysely` to `^0.28.14` to address CVE-2026-32763 and CVE-2026-33468.
- Refreshed workspace lockstep package versions for batch `#1`.
- Preserved the modular monolith foundation without adding business modules.

## v-1.0.0

### [v 1.0.0] 2026-04-28 - Foundation Baseline

- Created the cxnext modular monolith foundation.
- Added DDD primitives, in-process event infrastructure, app bootstraps, and assist governance.
- Established lockstep versioning, branching, commit, and release rules.
