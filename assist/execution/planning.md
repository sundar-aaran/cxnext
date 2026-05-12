# Planning

Active reference: `#87`

## Active

- `#87` Media manager, storage, and branding assets
  - Goal:
    - Add a frontend media manager, Laravel-style storage structure, and branded light/dark logo assets wired through the application.
  - Scope:
    - Repository storage folder bootstrap and frontend public linking.
    - Backend media HTTP endpoints for listing, uploading, deleting, and private downloads.
    - Settings route/page for media management.
    - Public logo, logo-dark, and favicon assets.
    - Branding updates for app shell, public pages, auth pages, and invoice fallback usage.
    - Release tracking/version alignment.
  - Constraints:
    - Storage must contain `public` and `private` folders.
    - Frontend should expose public media through a storage link/copy flow similar to Laravel.
    - Dark theme needs a distinct `logo-dark.svg`.
    - Existing company logo URL fields should remain compatible.
  - Planned validation:
    - Run focused frontend and server typechecks.
  - Implemented:
    - Reviewed current Next.js public asset setup, desk settings navigation, dashboard branding, and company logo fields.
    - Confirmed there was no existing storage link bootstrap, media manager UI, or backend upload/static-serving module.
    - Confirmed invoice and report print flows already support company logo URLs, which can be pointed at managed media assets.
    - Added `storage/public` and `storage/private` plus a frontend storage-link bootstrap for `/storage` and `/logo`.
    - Added authenticated backend media endpoints for list, upload, delete, and private file download.
    - Added Settings > Media Manager with public/private tabs, uploads, URL copy, and delete actions.
    - Added default logo, dark logo, and favicon assets and wired them into app metadata, desk shell branding, public pages, auth pages, and company defaults.
    - Added invoice and report print fallbacks to the new shared logo asset.
    - Reworked company logo editing to use a popup uploader that stores files into `storage/public/logo`.
    - Normalized company logo values to the shared `/storage/logo/<file>` path while the form shows only the file name.
    - Added overwrite protection for media uploads so replacing an existing logo requires an explicit second confirmation.
  - Validation:
    - `pnpm --filter @cxnext/server typecheck` passed.
    - `pnpm --filter @cxnext/frontend typecheck` passed.
    - `pnpm --filter @cxnext/ui typecheck` passed.
  - Residual risk:
    - Final runtime browser walkthrough is still pending.
    - Dashboard shell branding changes should stay narrowly scoped because the shared shell file is already large.
