# Operating the Agora VM

This manual covers day-to-day operations for the GCP VM running Agora's backend services.

## Services

Docker Compose runs:

- `postgres` — primary database and queue store.
- `indexer` — Arc/Base chain event ingestion.
- `daemon` — Fastify gateway, BYOK agent runtime, AI mediator.
- `cloudflared` — private tunnel from public API hostname to daemon.

Use both Compose files in production:

```bash
cd /opt/agora
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
```

For convenience:

```bash
alias agora='docker compose -f /opt/agora/docker-compose.yml -f /opt/agora/docker-compose.prod.yml'
```

## Common commands

Start or restart everything:

```bash
cd /opt/agora
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

Stop everything:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
```

Restart one service:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart daemon
```

Follow logs:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f daemon
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f indexer
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f cloudflared
```

Check health:

```bash
curl http://127.0.0.1:4000/health
curl http://127.0.0.1:4000/health/deep
curl http://127.0.0.1:4000/stats/llm-spend -H "X-Gateway-Secret: $API_GATEWAY_SECRET"
```

## Deployments

Manual deploy:

```bash
/opt/agora/scripts/vm-deploy.sh
```

The script pulls `main`, rebuilds containers, starts services, prints `docker compose ps`, and appends a UTC timestamp to `/var/log/agora/deploys.log`.

## Environment changes

Edit `/opt/agora/.env`, then restart affected services:

```bash
cd /opt/agora
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d daemon indexer cloudflared
```

Never commit `.env` to git. Rotate exposed secrets immediately.

## Inspecting Postgres

Open `psql`:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec postgres psql -U agora agora
```

Useful queries:

```sql
SELECT id, display_name, last_indexed_block, updated_at FROM chains ORDER BY id;
SELECT pk, chain_id, onchain_id, state, updated_at FROM escrows ORDER BY updated_at DESC LIMIT 20;
SELECT status, count(*) FROM agent_tasks GROUP BY status;
SELECT status, count(*) FROM mediation_queue GROUP BY status;
SELECT * FROM llm_spend ORDER BY date_utc DESC LIMIT 7;
```

Oldest pending work:

```sql
SELECT pk, status, created_at, NOW() - created_at AS age FROM agent_tasks WHERE status = 'pending' ORDER BY created_at ASC LIMIT 10;
SELECT pk, status, created_at, NOW() - created_at AS age FROM mediation_queue WHERE status = 'pending' ORDER BY created_at ASC LIMIT 10;
```

## Draining queues

To drain workers without accepting new web traffic:

1. Temporarily point Cloudflare Tunnel away from the service or stop `cloudflared`.
2. Let daemon workers process current queues.
3. Watch queue depth:

```bash
watch -n 5 "docker compose -f docker-compose.yml -f docker-compose.prod.yml exec -T postgres psql -U agora agora -c \"SELECT status, count(*) FROM agent_tasks GROUP BY status; SELECT status, count(*) FROM mediation_queue GROUP BY status;\""
```

4. Restart or deploy once pending/running queues are understood.

Do not manually delete queue rows unless you have recorded why and can recover the escrow state.

## Backups

Manual backup:

```bash
/opt/agora/scripts/vm-backup.sh
```

Expected output: a compressed SQL dump uploaded to `AGORA_BACKUP_BUCKET`, defaulting to `gs://agora-backups/postgres`.

Cron:

```cron
0 3 * * * /opt/agora/scripts/vm-backup.sh >> /var/log/agora/backup.log 2>&1
```

Check backup logs:

```bash
tail -100 /var/log/agora/backup.log
gsutil ls gs://agora-backups/postgres/ | tail
```

## Restores

Restore from a local or GCS dump:

```bash
/opt/agora/scripts/vm-restore.sh gs://agora-backups/postgres/agora-YYYY-MM-DDTHHMMSSZ.sql.gz
```

The restore script requires typing `RESTORE` and replaces the `agora` database. After restore, verify:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
curl http://127.0.0.1:4000/health/deep
```

## Rollback

If a deploy is bad:

```bash
cd /opt/agora
git log --oneline -5
git checkout <known-good-commit>
docker compose -f docker-compose.yml -f docker-compose.prod.yml build
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

After rollback:

1. Check `/health` and `/health/deep`.
2. Inspect daemon and indexer logs.
3. Confirm no migrations require a forward-only database change.
4. Open a follow-up fix branch.

## Cost checks

Daily/weekly checks:

- Vercel usage dashboard.
- GCP VM and network spend.
- OpenAI mediator spend.
- Cloudflare Tunnel/traffic anomalies.
- Postgres disk usage:

```bash
df -h
docker system df
```

## Incident checklist

1. Preserve logs and exact timestamps.
2. Identify affected layer: Vercel, Cloudflare, daemon, indexer, Postgres, chain RPC, contracts, or external LLM provider.
3. Stop public ingress if needed by stopping `cloudflared`.
4. Avoid destructive database changes until a backup is confirmed.
5. Patch, deploy, and verify the original failing flow.
6. Document the incident and add a regression check.
