#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <gs://bucket/path/agora.sql.gz | /local/path/agora.sql.gz>" >&2
  exit 64
fi

AGORA_DIR=${AGORA_DIR:-/opt/agora}
SOURCE=$1
RESTORE_FILE=/tmp/agora-restore.sql.gz
COMPOSE=(docker compose -f docker-compose.yml -f docker-compose.prod.yml)

cd "$AGORA_DIR"

cleanup() {
  rm -f "$RESTORE_FILE"
}
trap cleanup EXIT

if [[ "$SOURCE" == gs://* ]]; then
  gsutil cp "$SOURCE" "$RESTORE_FILE"
else
  cp "$SOURCE" "$RESTORE_FILE"
fi

read -r -p "This will replace the agora Postgres database. Type RESTORE to continue: " CONFIRM
if [[ "$CONFIRM" != "RESTORE" ]]; then
  echo "Restore cancelled."
  exit 1
fi

"${COMPOSE[@]}" up -d postgres
"${COMPOSE[@]}" exec -T postgres dropdb -U agora --if-exists agora
"${COMPOSE[@]}" exec -T postgres createdb -U agora agora
gunzip -c "$RESTORE_FILE" | "${COMPOSE[@]}" exec -T postgres psql -U agora agora
"${COMPOSE[@]}" up -d indexer daemon cloudflared

echo "Restore complete from $SOURCE"
