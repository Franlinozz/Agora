#!/usr/bin/env bash
set -euo pipefail

AGORA_DIR=${AGORA_DIR:-/opt/agora}
LOG_DIR=${AGORA_LOG_DIR:-/var/log/agora}
COMPOSE=(docker compose -f docker-compose.yml -f docker-compose.prod.yml)
MAX_DISK_USE_PERCENT=${MAX_DISK_USE_PERCENT:-85}

cd "$AGORA_DIR"
mkdir -p "$LOG_DIR"

check_disk() {
  local use_percent
  use_percent=$(df -P / | awk 'NR==2 {gsub(/%/, "", $5); print $5}')
  if (( use_percent >= MAX_DISK_USE_PERCENT )); then
    echo "Refusing deploy: root disk is ${use_percent}% used (limit ${MAX_DISK_USE_PERCENT}%)." >&2
    echo "Run docker builder prune -af, remove generated artifacts, or expand the VM disk before retrying." >&2
    exit 1
  fi
}

cleanup_build_cache() {
  docker builder prune -af >/dev/null 2>&1 || true
  docker container prune -f >/dev/null 2>&1 || true
}

git fetch origin main
git checkout main
git pull --ff-only origin main

check_disk
cleanup_build_cache
check_disk

# Build sequentially to avoid duplicate pnpm install layers spiking small VM disks.
COMPOSE_PARALLEL_LIMIT=1 "${COMPOSE[@]}" build
cleanup_build_cache
check_disk

"${COMPOSE[@]}" up -d
"${COMPOSE[@]}" ps
check_disk

echo "Deployed at $(date -u +'%Y-%m-%dT%H:%M:%SZ')" >> "$LOG_DIR/deploys.log"
