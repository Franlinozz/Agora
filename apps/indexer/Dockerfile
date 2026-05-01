FROM node:25-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/indexer ./apps/indexer
COPY packages ./packages
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @agora/sdk build
RUN pnpm --filter @agora/indexer build
RUN pnpm --filter @agora/indexer deploy --prod /prod/indexer

FROM node:25-alpine
WORKDIR /app
COPY --from=builder /prod/indexer/node_modules ./node_modules
COPY --from=builder /app/apps/indexer/dist ./dist
COPY --from=builder /app/apps/indexer/package.json ./
COPY --from=builder /app/apps/indexer/migrations ./migrations
USER node
CMD ["node", "dist/index.js"]
