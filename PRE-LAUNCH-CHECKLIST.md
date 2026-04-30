# Agora pre-launch checklist

Use this checklist before flipping DNS or publicly announcing Agora. Do not treat a green build as a launch approval; this list verifies contracts, backend, frontend, costs, backups, and operational safety.

## Smart contracts

- [ ] All Foundry tests pass with no warnings: `cd packages/contracts && forge test -vv`.
- [ ] Gas report reviewed: `forge test --gas-report`.
- [ ] Static analysis run, for example Slither, with no high-severity findings.
- [ ] AgentRegistry deployed to Arc testnet.
- [ ] EscrowManager deployed to Arc testnet.
- [ ] ReputationOracle deployed to Arc testnet.
- [ ] Test agent deployed on Arc.
- [ ] Test escrow created, delivered, mediated, and released — full happy path.
- [ ] Refund-expired path tested.
- [ ] Dispute/manual review path tested.
- [ ] Confidential mode tested: encrypt, deliver, decrypt/review, release.
- [ ] Base mainnet deployment follows `packages/contracts/MAINNET-CHECKLIST.md`.
- [ ] Base mainnet contracts verified on Basescan.
- [ ] Base sanity check script passes.
- [ ] Deployer wallet, mediator wallet, and operator wallets are distinct.
- [ ] Hot wallets funded only with minimum required operational gas.
- [ ] Emergency pause/owner procedures are documented and tested.

## Backend (VM)

- [ ] GCP VM provisioned, target e2-small or approved equivalent.
- [ ] Ubuntu patched: `sudo apt-get update && sudo apt-get upgrade`.
- [ ] Docker and Docker Compose installed.
- [ ] Repo cloned to `/opt/agora`.
- [ ] `.env` populated with production values.
- [ ] `POSTGRES_PASSWORD` generated and stored in password manager.
- [ ] `API_GATEWAY_SECRET` generated and shared only with Vercel.
- [ ] `DAEMON_MASTER_KEY` generated and stored securely.
- [ ] Mediator keypair generated; secret key stored securely; public key set where needed.
- [ ] `OPENAI_API_KEY` set only on VM.
- [ ] Cloudflare Tunnel configured; token in VM `.env`.
- [ ] VM firewall exposes SSH only; Postgres and daemon are localhost-bound.
- [ ] `docker compose -f docker-compose.yml -f docker-compose.prod.yml config` passes.
- [ ] `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d` runs cleanly.
- [ ] `docker compose ps` shows all services healthy.
- [ ] Daemon `/health` returns 200.
- [ ] Daemon `/health/deep` returns 200.
- [ ] Indexer backfilled Arc successfully.
- [ ] Indexer backfilled Base successfully, or Base deferred status is documented.
- [ ] `chains.last_indexed_block` updates continuously.
- [ ] Agent runtime processes a BYOK test task.
- [ ] Mediator successfully processes and logs a test delivery.
- [ ] `$0.20/day` mediator cap tested by lowering cap in staging and confirming fallback behavior.
- [ ] Backup script tested manually; file appears in GCS.
- [ ] Restore script tested against a non-production database.
- [ ] Backup cron installed: `0 3 * * * /opt/agora/scripts/vm-backup.sh >> /var/log/agora/backup.log 2>&1`.
- [ ] VM logs are bounded by Docker json-file rotation.

## Frontend (Vercel)

- [ ] Vercel project linked to GitHub repo.
- [ ] Vercel root directory set to `apps/web`.
- [ ] Production env vars set in Vercel dashboard.
- [ ] VM-only secrets are not set in Vercel: no OpenAI key, DB URL, mediator secret, deployer key, or daemon master key.
- [ ] Custom domain added.
- [ ] DNS records verified.
- [ ] HTTPS certificate active.
- [ ] Production deploy succeeds.
- [ ] Home page loads.
- [ ] Agents page loads.
- [ ] Agent detail page loads.
- [ ] Deploy wizard loads.
- [ ] Dashboard loads.
- [ ] Hire flow page loads.
- [ ] Escrow page loads.
- [ ] Leaderboard loads.
- [ ] Docs/about pages load.
- [ ] `/api/stats` returns valid JSON.
- [ ] `/api/agents` returns valid JSON.
- [ ] `/api/events` SSE connects.
- [ ] `/api/escrows/:id/log` SSE connects.
- [ ] Wallet connect modal opens.
- [ ] Wallet connect works with target wallets.
- [ ] Chain switcher shows Arc and Base.
- [ ] Rialo and Arcium appear disabled/deferred if not live.
- [ ] Chatbot tier 1 FAQ returns instant answers.
- [ ] Chatbot tier 2 LLM works.
- [ ] Chatbot tier 2 respects the daily mediator cap.
- [ ] Vercel function logs show no direct DB, cron, RPC polling, or LLM work.
- [ ] Function execution time is consistently under one second for proxy routes.

## Smoke test

- [ ] Set environment variables for the smoke test:

```bash
export AGORA_WEB_URL=https://agora.example.com
export AGORA_API_URL=https://agora.example.com/api
export AGORA_GATEWAY_URL=https://api.agora.example.com
export API_GATEWAY_SECRET=<same-secret-as-vm>
export TEST_ESCROW_ID=<known-mediated-test-escrow-id>
# Optional, for direct indexer freshness check if psql is available:
export DATABASE_URL=postgres://agora:<password>@127.0.0.1:5432/agora
```

- [ ] Run `./scripts/smoke-test.sh`.
- [ ] Smoke test exits 0.
- [ ] Any skipped optional checks are completed manually.

## Cost monitoring

- [ ] Vercel usage alerts configured at 50%, 80%, and 100%.
- [ ] GCP budget alert configured.
- [ ] OpenAI usage alert configured.
- [ ] Cloudflare usage notifications reviewed/configured.
- [ ] Daily or weekly cost review reminder created.
- [ ] Confirm Vercel Image Optimization remains disabled unless intentionally needed.
- [ ] Confirm Vercel Speed Insights/Web Analytics paid tiers are disabled unless intentionally needed.
- [ ] Confirm Docker memory limits fit the VM budget.

## Observability and operations

- [ ] `/health` monitored.
- [ ] `/health/deep` monitored or checked before/after deploys.
- [ ] `/stats/llm-spend` checked after launch.
- [ ] Backup logs reviewed.
- [ ] Deploy logs written to `/var/log/agora/deploys.log`.
- [ ] Operator knows rollback command from `docs/operating-the-vm.md`.
- [ ] Operator knows how to stop public ingress by stopping `cloudflared`.
- [ ] Incident response notes are available in `docs/operating-the-vm.md`.

## Marketing prep

- [ ] Twitter/X handle created, for example `@agora_protocol` if available.
- [ ] Discord server created with rules, support, builds, and announcements channels.
- [ ] Arc Discord joined.
- [ ] Agora introduced in the appropriate Arc builds/showcase channel.
- [ ] Base ecosystem/grants channels reviewed.
- [ ] Rialo/Arcium builder channels monitored for integration readiness.
- [ ] Arc grant application submitted if applicable.
- [ ] First demo agent deployed publicly with a fun, low-risk task.
- [ ] Demo script prepared.
- [ ] Launch tweet drafted.
- [ ] Screenshots or demo video prepared.

## Legal and safety

- [ ] Terms of Service drafted.
- [ ] Privacy Policy drafted.
- [ ] Cookie banner removed unless cookies/trackers actually require it.
- [ ] Landing page clearly distinguishes testnet vs mainnet.
- [ ] Mainnet warning shown where users can put funds at risk.
- [ ] Disclosure states Agora v1 is unaudited and users proceed at their own risk.
- [ ] SECURITY.md contains a monitored vulnerability report address.
- [ ] CODE_OF_CONDUCT.md contact address is monitored or updated.
- [ ] No private keys, API keys, `.env`, or database dumps are committed.

## Final go/no-go

- [ ] Latest `main` is deployed to VM.
- [ ] Latest `main` is deployed to Vercel production.
- [ ] Contracts and deployed addresses match env vars.
- [ ] Full happy path works with a real wallet.
- [ ] Backup exists and restore process is understood.
- [ ] Cost alerts are active.
- [ ] Human operator explicitly says: **Go live**.
