FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/daemon ./apps/daemon
COPY apps/indexer ./apps/indexer
COPY packages ./packages
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @agora/daemon build

FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache tini
COPY --from=builder /app/apps/daemon/dist ./dist
COPY --from=builder /app/apps/daemon/package.json ./
COPY --from=builder /app/node_modules ./node_modules
USER node
STOPSIGNAL SIGTERM
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/index.js"]
