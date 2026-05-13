# Planning

Active reference: `#91`

## Active

- `#91` Harden queue startup when queue tables are missing
  - Goal:
    - Keep cloud deployments online when the queue module is present in code but the target database has not yet run the queue migrations.
  - Scope:
    - Backend queue worker bootstrap under `apps/server/src/modules/queue`
    - Queue API error handling for unavailable storage
    - Execution tracking, changelog, and lockstep version update
  - Constraints:
    - Do not hide the migration gap; the app should log a clear warning and queue endpoints should fail explicitly once storage is unavailable.
    - Do not require Redis or BullMQ for this fix; this is strictly about the existing local queue runner.
    - Keep the server alive so non-queue application surfaces can still boot on cloud.
  - Planned validation:
    - Run `pnpm --filter @cxnext/server typecheck`
  - Implemented:
    - Wrapped the queue poller startup path so missing `queue_jobs` table errors disable the worker cleanly instead of escaping the timer callback and crashing Node.
    - Added a one-time queue-unavailable state with a clear migration warning through the Nest logger.
    - Guarded queue read/write entry points so they return a controlled `503 Service Unavailable` when queue storage has been disabled after bootstrap failure.
    - Logged unexpected poller errors without rethrowing them from the interval callback.
  - Validation:
    - `pnpm --filter @cxnext/server typecheck`
  - Residual risk:
    - The queue and mail features still require the latest database migrations on the target deployment to become operational; this change only prevents an app-wide crash before those migrations are applied.
