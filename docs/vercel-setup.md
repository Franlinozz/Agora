# Vercel setup

Agora's frontend is a Next.js app in `apps/web`. Vercel should only host the UI and thin API proxy routes. Long-running work, indexing, Postgres, RPC polling, and LLM calls stay on the VM.

## Project settings

Create or update the Vercel project with these settings:

- **Framework Preset:** Next.js
- **Root Directory:** `apps/web`
- **Node.js Version:** 20.x
- **Install Command:** `cd ../.. && pnpm install --frozen-lockfile`
- **Build Command:** `cd ../.. && pnpm turbo build --filter=@agora/web`
- **Output Directory:** leave unset for Next.js
- **Region:** `iad1`

The checked-in config lives at `apps/web/vercel.json`.

## Cost discipline

Keep Vercel cheap and predictable:

- Keep API routes as proxy routes only.
- Do not connect Vercel functions directly to Postgres.
- Do not run cron, indexers, RPC polling, or LLM calls on Vercel.
- Keep Edge runtime for non-streaming proxy routes.
- Keep Node.js runtime only for SSE routes:
  - `app/api/events/route.ts`
  - `app/api/escrows/[id]/log/route.ts`
- Function CPU: **Standard**. Do not enable Performance CPU unless there is a measured need.
- Function memory: keep proxy/edge routes minimal; SSE routes can use up to 1024 MB if needed.
- Disable paid Speed Insights and paid Web Analytics unless explicitly needed.
- Disable Image Optimization if no raster/remote images are used. Agora primarily uses SVG/design-system assets, so this should stay off unless the product changes.

## Production environment variables

Set these in Vercel with **Production** scope.

### Public chain variables

- `NEXT_PUBLIC_ARC_RPC_URL`
- `NEXT_PUBLIC_ARC_USDC_ADDRESS`
- `NEXT_PUBLIC_ARC_AGENT_REGISTRY`
- `NEXT_PUBLIC_ARC_ESCROW_MANAGER`
- `NEXT_PUBLIC_ARC_REPUTATION_ORACLE`
- `NEXT_PUBLIC_BASE_RPC_URL`
- `NEXT_PUBLIC_BASE_AGENT_REGISTRY`
- `NEXT_PUBLIC_BASE_ESCROW_MANAGER`
- `NEXT_PUBLIC_BASE_REPUTATION_ORACLE`
- `NEXT_PUBLIC_RIALO_RPC_URL`
- `NEXT_PUBLIC_ARCIUM_ENDPOINT`

### Wallet/UI variables

- `NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID`

### VM proxy variables

- `API_GATEWAY_URL` — Cloudflare Tunnel URL for the daemon, for example `https://api.agora.example.com`.
- `API_GATEWAY_SECRET` — same secret configured on the VM daemon.

## Never set these in Vercel

These live only on the VM or in deployment tooling:

- `OPENAI_API_KEY`
- `MEDIATOR_SECRET_KEY`
- `MEDIATOR_PUBLIC_KEY` unless a frontend encryption flow explicitly needs the public key
- `DAEMON_MASTER_KEY`
- `POSTGRES_PASSWORD`
- `DATABASE_URL`
- `ARC_DEPLOYER_PRIVATE_KEY`
- `BASE_DEPLOYER_PRIVATE_KEY`
- any wallet private key or seed phrase

## Usage alerts

Set usage alerts before launch:

1. Open Vercel dashboard → project/team usage settings.
2. Add alerts at **50%**, **80%**, and **100%** of the monthly included quota.
3. Route alerts to an email or channel that will be seen quickly.
4. Review usage after every launch/demo day.

This is intentionally loud. A proxy-only Vercel app should have very low compute usage; spikes usually mean an accidental serverless workload, a loop, or abusive traffic.

## Preview deployment test

Before production launch:

1. Open a PR and let Vercel create a preview deployment.
2. Verify static pages load:
   - `/`
   - `/agents`
   - `/dashboard`
   - `/leaderboard`
   - `/docs`
3. Verify proxy routes return quickly:
   - `/api/stats`
   - `/api/agents`
4. Verify SSE routes connect without timing out:
   - `/api/events`
   - `/api/escrows/<id>/log`
5. Check Vercel Function logs for errors.
6. Confirm no function does direct DB, RPC polling, cron, or LLM work.

## Deployment via GitHub Actions

The `deploy-web.yml` workflow deploys on pushes to `main` when frontend or package paths change. Required GitHub secrets are documented in `docs/deployment.md`:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

The workflow runs Vercel commands from `apps/web` so Vercel reads `apps/web/vercel.json`.
