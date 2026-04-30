#!/usr/bin/env bash
set -euo pipefail

AGORA_DIR=${AGORA_DIR:-/opt/agora}
LOG_DIR=${AGORA_LOG_DIR:-/var/log/agora}
COMPOSE=(docker compose -f docker-compose.yml -f docker-compose.prod.yml)

cd "$AGORA_DIR"
mkdir -p "$LOG_DIR"

git fetch origin main
git checkout main
git pull --ff-only origin main

"${COMPOSE[@]}" build
"${COMPOSE[@]}" up -d
"${COMPOSE[@]}" ps

echo "Deployed at $(date -u +'%Y-%m-%dT%H:%M:%SZ')" >> "$LOG_DIR/deploys.log"
