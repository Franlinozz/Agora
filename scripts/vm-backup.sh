#!/usr/bin/env bash
set -euo pipefail

AGORA_DIR=${AGORA_DIR:-/opt/agora}
BACKUP_BUCKET=${AGORA_BACKUP_BUCKET:-gs://agora-backups/postgres}
TS=$(date -u +%Y-%m-%dT%H%M%SZ)
BACKUP_FILE="/tmp/agora-${TS}.sql.gz"

cd "$AGORA_DIR"

cleanup() {
  rm -f "$BACKUP_FILE"
}
trap cleanup EXIT

docker compose exec -T postgres pg_dump -U agora agora | gzip > "$BACKUP_FILE"
gsutil cp "$BACKUP_FILE" "$BACKUP_BUCKET/"

echo "Backup written to ${BACKUP_BUCKET}/$(basename "$BACKUP_FILE")"
