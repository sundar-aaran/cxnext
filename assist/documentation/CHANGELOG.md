# Changelog

## Version State

- Current package version: `1.0.46`
- Current release tag: `v-1.0.46`
- Versioned changelog label format: `v 1.0.<reference>`
- Version section format: `## v-1.0.<reference>`
- Entry format: `### [v 1.0.<reference>] YYYY-MM-DD - Title`

## v-1.0.46

### [v 1.0.46] 2026-04-29 - Refactor Company Read Boundaries

- Removed direct tenant and industry joins from company persistence.
- Added company-owned application ports and Kysely lookup adapters for tenant and industry display names.
- Added boundary coverage to prevent company persistence from reintroducing tenant or industry joins.

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
