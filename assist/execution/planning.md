# Planning

Active reference: `#45`

## Active

- `#45` Refactor tenant module write boundaries and events
  - Goal:
    - fix the first boundary slice by making the tenant module use application write use cases and publish domain events through the shared event bus after successful state changes.
  - Scope:
    - add create, update, and soft-delete tenant use cases under the tenant application layer.
    - keep tenant controllers/resolvers thin by routing writes through use cases.
    - adapt tenant aggregate domain events to `@cxnext/event` events and publish them from the application layer.
    - register new use cases in `TenantsModule`.
    - validate with focused tests/typecheck and prepare a PR.
  - Constraints:
    - fix one module slice first; do not refactor companies/common/industries in this batch.
    - preserve existing tenant API response shapes and database behavior.
    - keep domain code framework-free and avoid adding business behavior beyond current tenant CRUD semantics.
    - do not revert unrelated work.
  - Planned validation:
    - run `@cxnext/server` typecheck.
    - run relevant event/core architecture tests if event bridging changes shared assumptions.
    - run version sync for reference `#45`.
  - Implemented:
    - created branch `codex/refactor-tenant-boundaries-events`.
    - added tenant create, update, and delete use cases under `apps/server/src/modules/tenants/application/use-cases`.
    - removed direct tenant repository write injection from the HTTP controller and routed create/update/delete through application use cases.
    - added a `DomainEventPublisher` application port and an `EventBusDomainEventPublisher` infrastructure adapter.
    - published `tenants.tenant-created` after successful tenant creation.
    - registered new use cases and event publisher adapter in `TenantsModule`.
    - added focused coverage for tenant creation event publication.
    - added changelog entry `v-1.0.45` and synchronized workspace package versions to `1.0.45`.
    - committed and pushed branch `codex/refactor-tenant-boundaries-events`.
  - Validation:
    - passed `C:\Users\sunda\AppData\Roaming\npm\pnpm.cmd --filter @cxnext/server typecheck`.
    - passed targeted ESLint for changed tenant files and the new tenant use-case test.
    - passed `C:\Users\sunda\AppData\Roaming\npm\pnpm.cmd exec vitest run tests/server/tenants/create-tenant-use-case.test.ts tests/architecture/source-tree-artifacts.test.ts packages/core/test/domain-primitives.test.ts packages/event/test/event-bus.test.ts`.
    - full `@cxnext/server lint` is still blocked by pre-existing `common` module lint errors outside this tenant slice.
    - passed `node scripts/version-sync.mjs --ref 45`.
  - Residual risk:
    - tenant update/delete do not publish domain events yet because no update/delete domain events are modeled in the current tenant aggregate.
    - broader strict module-shape issues in `common`, `companies`, and `industries` remain for follow-up batches.
    - PR creation is blocked in this shell because `gh` is not installed and no GitHub token environment variable is available; use the pushed branch URL to open the PR.
