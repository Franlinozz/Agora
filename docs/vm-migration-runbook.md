# Agora VM Migration Runbook

Use this when moving Agora from the current small VM to a larger disk VM.

## Goal

Move the production VM services with minimal downtime:

- Postgres database
- daemon API gateway
- indexer
- cloudflared tunnel
- Docker Compose runtime
- deployment scripts and repo state

Do not commit secrets, `.env`, private keys, tunnel tokens, database dumps, or wallet material to GitHub.

## Recommended target VM

Minimum practical size:

- 2 vCPU
- 4 GB RAM
- 50 GB disk minimum; 80-100 GB preferred
- Ubuntu/Debian LTS
- Docker + Docker Compose plugin
- Git

The current app can run on less, but builds and Docker layers spike disk usage. The larger disk is mainly for safe deployments.

## What is already in GitHub

The repo contains the important reproducible infrastructure:

- `docker-compose.yml`
- `docker-compose.prod.yml`
- `apps/indexer/Dockerfile`
- `apps/daemon/Dockerfile`
- `scripts/vm-deploy.sh`
- `scripts/vm-backup.sh`
- `scripts/vm-restore.sh`
- `scripts/smoke-test.sh`
- deployment docs under `docs/`

## What must be transferred securely outside GitHub

Copy these through SSH/scp, a secrets manager, or a private encrypted channel:

- Production `.env`
- Cloudflare tunnel token if not in `.env`
- Postgres backup dump
- Any operational API keys
- Any deployer/private key files if they still exist on the VM

Never put these in repo, issues, chat logs, or public storage.

## Pre-migration checklist on old VM

From the Agora repo directory:

```bash
git status --short --branch
git log --oneline -5
df -h /
docker ps
docker system df
```

Create a database backup:

```bash
TS=$(date -u +%Y%m%dT%H%M%SZ)
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U agora agora | gzip > /tmp/agora-${TS}.sql.gz
ls -lh /tmp/agora-${TS}.sql.gz
```

Optional integrity check:

```bash
gzip -t /tmp/agora-${TS}.sql.gz
```

## New VM bootstrap

Install Docker, Compose, Git, and basic tools. Example for Debian/Ubuntu:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl git gnupg
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"
```

Log out and back in so Docker group membership applies.

Clone repo:

```bash
sudo mkdir -p /opt/agora
sudo chown "$USER":"$USER" /opt/agora
git clone https://github.com/Franlinozz/Agora.git /opt/agora
cd /opt/agora
```

Copy production `.env` securely into `/opt/agora/.env`.

## Restore database on new VM

Copy backup from old VM to new VM, for example:

```bash
scp old-vm:/tmp/agora-YYYYMMDDTHHMMSSZ.sql.gz /tmp/agora-restore.sql.gz
```

Start Postgres only:

```bash
cd /opt/agora
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d postgres
```

Restore:

```bash
gunzip -c /tmp/agora-restore.sql.gz | \
  docker compose -f docker-compose.yml -f docker-compose.prod.yml exec -T postgres \
  psql -U agora agora
```

If the database already exists with partial data, use the existing `scripts/vm-restore.sh` instead, but read it first because it drops and recreates the DB.

## Start services on new VM

```bash
cd /opt/agora
MAX_DISK_USE_PERCENT=85 ./scripts/vm-deploy.sh
```

If building both daemon and indexer is heavy, build/restart one service at a time:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml build daemon
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps daemon
docker builder prune -af --filter until=0s

docker compose -f docker-compose.yml -f docker-compose.prod.yml build indexer
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps indexer
```

## Cutover

Preferred cutover path is Cloudflare Tunnel:

1. Stop old cloudflared or disable old tunnel route.
2. Start cloudflared on new VM with the same tunnel token/config.
3. Confirm `https://api.agoraagentai.xyz/health` returns OK.
4. Confirm Vercel frontend proxies still work.

Avoid running two indexers against the same public API target during cutover if it can cause confusion. For a clean cutover, pause old `indexer` after new one is healthy.

## Verification

Run:

```bash
docker ps
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
curl -fsS http://127.0.0.1:4000/health && echo
curl -fsS https://api.agoraagentai.xyz/health && echo
curl -fsS https://agoraagentai.vercel.app/api/agents?limit=5 | head
curl -fsS https://agoraagentai.vercel.app/api/leaderboard?limit=5 | head
df -h /
docker system df
```

Check logs:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs --tail=100 daemon
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs --tail=100 indexer
```

## Rollback

Keep the old VM running until the new VM is verified.

Rollback is simply:

1. Stop new cloudflared or route.
2. Re-enable old cloudflared/tunnel route.
3. Confirm old API health.

Only delete the old VM after at least 24 hours of stable new VM operation.

## Post-migration cleanup

- Rotate any secrets that were copied manually if exposure risk exists.
- Delete local DB dump files from both VMs after confirming backups exist.
- Confirm disk guardrails are still in place.
- Update internal notes with the new VM hostname/IP and disk size.
