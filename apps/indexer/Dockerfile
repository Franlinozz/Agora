FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/indexer ./apps/indexer
COPY packages ./packages
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @agora/indexer build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/apps/indexer/dist ./dist
COPY --from=builder /app/apps/indexer/package.json ./
COPY --from=builder /app/apps/indexer/migrations ./migrations
COPY --from=builder /app/node_modules ./node_modules
USER node
CMD ["node", "dist/index.js"]
