# syntax=docker/dockerfile:1.7

FROM node:24-bookworm-slim AS base
WORKDIR /app
ENV APP_HOST=0.0.0.0 \
  APP_HTTP_PORT=4000 \
  AUTH_TOKEN_EXPIRES_SECONDS=86400 \
  CI=true \
  FRONTEND_HTTP_PORT=3000 \
  PORT=4000
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl git docker.io \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/cli/package.json apps/cli/package.json
COPY apps/desktop/package.json apps/desktop/package.json
COPY apps/frontend/package.json apps/frontend/package.json
COPY apps/server/package.json apps/server/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/core/package.json packages/core/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/event/package.json packages/event/package.json
COPY packages/hooks/package.json packages/hooks/package.json
COPY packages/types/package.json packages/types/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/utils/package.json packages/utils/package.json
COPY packages/validation/package.json packages/validation/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS builder
COPY . .
RUN pnpm --filter @cxnext/types build \
  && pnpm --filter @cxnext/db build \
  && pnpm --filter @cxnext/server build \
  && pnpm --filter @cxnext/frontend build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app /app
EXPOSE 3000 4000
CMD ["node", "scripts/start.mjs"]
