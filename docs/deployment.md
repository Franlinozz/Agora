# Agora deployment

This runbook covers the production deployment path for Agora: GitHub Actions CI/CD, the GCP VM backend, Vercel frontend, Cloudflare Tunnel, backups, and release safety checks.

## Required GitHub secrets

Configure these in **GitHub → Settings → Secrets and variables → Actions**.

### Vercel deployment

- `VERCEL_TOKEN` — Vercel API token with deploy access.
- `VERCEL_ORG_ID` — Vercel team/user ID.
- `VERCEL_PROJECT_ID` — Vercel project ID for `apps/web`.

### VM deployment

- `VM_HOST` — public SSH hostname/IP for the GCP VM.
- `VM_USER` — SSH user with access to `/opt/agora` and Docker.
- `VM_SSH_KEY` — private key for the deploy user.

### Contracts

- `BASESCAN_API_KEY` — required for Base contract verification scripts.

## GitHub Actions

Agora uses five automation files:

- `.github/workflows/ci.yml` — runs on PRs and pushes to `main`.
- `.github/workflows/contracts-test.yml` — runs Foundry tests when contracts change.
- `.github/workflows/deploy-web.yml` — deploys Vercel production on relevant `main` pushes.
- `.github/workflows/deploy-vm.yml` — SSHs into the VM and runs `/opt/agora/scripts/vm-deploy.sh` on relevant `main` pushes.
- `.github/dependabot.yml` — weekly dependency update PRs for npm, GitHub Actions, and Docker.

## Branch protection

Configure this in GitHub settings; it cannot be fully enforced from repo files.

Recommended `main` rules:

1. Require pull request before merge.
2. Require status checks to pass before merge:
   - `CI / Lint, typecheck, test, build`
   - `Contracts test / Foundry tests` when contracts changed
3. Require branches to be up to date before merging.
4. Require conversation resolution.
5. Restrict force pushes and branch deletion.

## VM setup

Provision a GCP e2-small Ubuntu VM. Keep inbound firewall tight; the daemon is exposed through Cloudflare Tunnel, not by opening port `4000` publicly.

Install system dependencies:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg git gzip
```

Install Docker and Compose using Docker's official Linux instructions, then add the deploy user to the `docker` group.

Clone the repo:

```bash
sudo mkdir -p /opt/agora /var/log/agora
sudo chown -R "$USER":"$USER" /opt/agora /var/log/agora
git clone git@github.com:<org-or-user>/agora.git /opt/agora
cd /opt/agora
```

Create `/opt/agora/.env` from `.env.example` and fill production values. Critical VM-only secrets include:

- `POSTGRES_PASSWORD`
- `API_GATEWAY_SECRET`
- `DAEMON_MASTER_KEY`
- `OPENAI_API_KEY`
- `MEDIATOR_SECRET_KEY`
- `CLOUDFLARE_TUNNEL_TOKEN`

Do **not** commit `.env`.

Start services:

```bash
cd /opt/agora
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
curl http://127.0.0.1:4000/health
```

Deep health should become `200` only after Postgres is migrated, chain RPCs are reachable, and services are configured:

```bash
curl http://127.0.0.1:4000/health/deep
```

## Cloudflare Tunnel

Create a tunnel that routes the public API hostname, for example `https://api.agora.example.com`, to the daemon service:

```text
http://daemon:4000
```

Store the tunnel token in `CLOUDFLARE_TUNNEL_TOKEN`. The Compose service runs `cloudflared` with that token. Keep VM firewall rules closed except SSH.

## Vercel setup

Set production env vars in the Vercel dashboard:

- Public chain variables: `NEXT_PUBLIC_ARC_RPC_URL`, `NEXT_PUBLIC_BASE_RPC_URL`, contract addresses, and `NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID`.
- `API_GATEWAY_URL` — Cloudflare Tunnel URL.
- `API_GATEWAY_SECRET` — same value as the VM.

Never set VM-only secrets in Vercel:

- `OPENAI_API_KEY`
- `MEDIATOR_SECRET_KEY`
- `DAEMON_MASTER_KEY`
- deployer private keys

## Deployments

Manual VM deploy:

```bash
/opt/agora/scripts/vm-deploy.sh
```

GitHub Actions deploys automatically on pushes to `main` when relevant paths change:

- Web deploy: `apps/web/**`, `packages/**`, workspace/build config.
- VM deploy: `apps/indexer/**`, `apps/daemon/**`, `packages/**`, Compose files, VM scripts.

## Backups

Set the backup bucket path if not using the default:

```bash
export AGORA_BACKUP_BUCKET=gs://agora-backups/postgres
```

Manual backup:

```bash
/opt/agora/scripts/vm-backup.sh
```

Nightly cron:

```cron
0 3 * * * /opt/agora/scripts/vm-backup.sh >> /var/log/agora/backup.log 2>&1
```

Restore from GCS or a local file:

```bash
/opt/agora/scripts/vm-restore.sh gs://agora-backups/postgres/agora-YYYY-MM-DDTHHMMSSZ.sql.gz
```

The restore script prompts for `RESTORE` before replacing the database.

## Cost monitoring

Set alerts before launch:

- Vercel usage alerts at 50%, 80%, and 100%.
- GCP project budget alert.
- OpenAI usage alert.
- Optional weekly manual review of Cloudflare, Vercel, GCP, and OpenAI usage.

## Release safety checklist

Before merging release PRs:

1. CI passes.
2. Contract tests pass if Solidity changed.
3. No `.env` or private key changes are staged.
4. Docker Compose config validates on a machine with Docker:

```bash
POSTGRES_PASSWORD=dummy CLOUDFLARE_TUNNEL_TOKEN=dummy docker compose -f docker-compose.yml -f docker-compose.prod.yml config
```

5. VM `/health` returns `200` after deploy.
6. VM `/health/deep` returns `200` before public launch.
