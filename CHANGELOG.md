# Changelog

## Version State

- Current package version: `1.0.5`
- Current release tag: `v-1.0.5`
- Versioned changelog label format: `v 1.0.<reference>`
- Version section format: `## v-1.0.<reference>`
- Entry format: `### [v 1.0.<reference>] YYYY-MM-DD - Title`

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
