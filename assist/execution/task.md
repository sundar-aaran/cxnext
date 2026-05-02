# Task

Active reference: `#69`

## Active

- [x] `#69` Document auth and runtime stabilization in release tracking
  - [x] Phase 1: release notes
    - [x] Capture the database refresh, env cleanup, proxy migration, and auth/runtime fixes in the changelog.
  - [x] Phase 2: execution alignment
    - [x] Refresh task tracking to the active `1.0.69` release reference.
    - [x] Refresh planning notes to match the completed stabilization batch.

## Notes For Next Agent

- The live app now points to `codexsun_db` from the root `.env` and the database was refreshed from the current migrations/seeders.
- Frontend auth runtime depends on the root `.env` value for `NEXT_PUBLIC_API_URL`; the direct `process.env.NEXT_PUBLIC_API_URL` access in `apps/frontend/lib/runtime-env.ts` is intentional for Next.js client bundling.
- The active route guard file is `apps/frontend/proxy.ts`; do not reintroduce the deprecated `middleware.ts` convention.
