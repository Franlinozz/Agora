#!/usr/bin/env bash
set -euo pipefail

MOUNT_POINT="${DISK_GUARD_MOUNT:-/}"
WARN_PERCENT="${DISK_GUARD_WARN_PERCENT:-85}"
LOG_FILE="${DISK_GUARD_LOG:-/home/chatwithnonso01/.openclaw/workspace/agora/logs/disk-guard.log}"
mkdir -p "$(dirname "$LOG_FILE")"

read -r used_percent avail size fs < <(df -P -h "$MOUNT_POINT" | awk 'NR==2 { gsub(/%/, "", $5); print $5, $4, $2, $1 }')
timestamp="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"

if (( used_percent >= WARN_PERCENT )); then
  printf '%s WARN disk usage %s%% >= %s%% on %s (%s free of %s, fs=%s)\n' "$timestamp" "$used_percent" "$WARN_PERCENT" "$MOUNT_POINT" "$avail" "$size" "$fs" | tee -a "$LOG_FILE"
  exit 2
fi

printf '%s OK disk usage %s%% < %s%% on %s (%s free of %s, fs=%s)\n' "$timestamp" "$used_percent" "$WARN_PERCENT" "$MOUNT_POINT" "$avail" "$size" "$fs" >> "$LOG_FILE"
