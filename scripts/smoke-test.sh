#!/usr/bin/env bash
set -euo pipefail

WEB_URL=${AGORA_WEB_URL:-https://agora.example.com}
API_URL=${AGORA_API_URL:-${WEB_URL%/}/api}
GATEWAY_URL=${AGORA_GATEWAY_URL:-}
GATEWAY_SECRET=${API_GATEWAY_SECRET:-}
TEST_ESCROW_ID=${TEST_ESCROW_ID:-}
DATABASE_URL=${DATABASE_URL:-}

failures=0

log() { printf '\n\033[1m%s\033[0m\n' "$*"; }
pass() { printf '  \033[32m✓\033[0m %s\n' "$*"; }
warn() { printf '  \033[33m!\033[0m %s\n' "$*"; }
fail() { printf '  \033[31m✗\033[0m %s\n' "$*"; failures=$((failures + 1)); }

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    fail "Missing required command: $1"
  fi
}

curl_body() {
  local url=$1
  local out=$2
  local code
  code=$(curl -LfsS --max-time 20 -o "$out" -w '%{http_code}' "$url" || true)
  printf '%s' "$code"
}

check_http_200() {
  local label=$1
  local url=$2
  local out
  out=$(mktemp)
  local code
  code=$(curl_body "$url" "$out")
  if [[ "$code" == "200" ]]; then
    pass "$label returned 200"
  else
    fail "$label returned HTTP ${code:-curl-failed}"
  fi
  rm -f "$out"
}

check_json_url() {
  local label=$1
  local url=$2
  local validator=$3
  local out
  out=$(mktemp)
  local code
  code=$(curl_body "$url" "$out")
  if [[ "$code" != "200" ]]; then
    fail "$label returned HTTP ${code:-curl-failed}"
    rm -f "$out"
    return
  fi

  if node -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); ${validator}" "$out"; then
    pass "$label returned valid JSON"
  else
    fail "$label JSON validation failed"
  fi
  rm -f "$out"
}

check_gateway_deep_health() {
  if [[ -z "$GATEWAY_URL" ]]; then
    fail 'AGORA_GATEWAY_URL is required to check VM /health/deep'
    return
  fi

  local out
  out=$(mktemp)
  local code
  code=$(curl -LfsS --max-time 30 -o "$out" -w '%{http_code}' "${GATEWAY_URL%/}/health/deep" || true)
  if [[ "$code" == "200" ]] && node -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); if(data.ok !== true) process.exit(1)" "$out"; then
    pass 'VM gateway /health/deep is healthy'
  else
    fail "VM gateway /health/deep unhealthy or unavailable (HTTP ${code:-curl-failed})"
    sed -n '1,20p' "$out" || true
  fi
  rm -f "$out"
}

check_llm_spend_zero() {
  if [[ -z "$GATEWAY_URL" || -z "$GATEWAY_SECRET" ]]; then
    fail 'AGORA_GATEWAY_URL and API_GATEWAY_SECRET are required to check /stats/llm-spend'
    return
  fi

  local out
  out=$(mktemp)
  local code
  code=$(curl -LfsS --max-time 20 -H "X-Gateway-Secret: $GATEWAY_SECRET" -o "$out" -w '%{http_code}' "${GATEWAY_URL%/}/stats/llm-spend" || true)
  if [[ "$code" == "200" ]] && node -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); if(Number(data.centsSpent) !== 0) process.exit(1)" "$out"; then
    pass 'LLM spend tracker is at $0.00 for the day'
  else
    fail "LLM spend tracker is not fresh/zero or unavailable (HTTP ${code:-curl-failed})"
    sed -n '1,20p' "$out" || true
  fi
  rm -f "$out"
}

check_fresh_indexer() {
  if [[ -z "$DATABASE_URL" ]]; then
    warn 'DATABASE_URL not set; skipping direct Postgres freshness check'
    return
  fi
  if ! command -v psql >/dev/null 2>&1; then
    warn 'psql not installed; skipping direct Postgres freshness check'
    return
  fi

  local count
  count=$(psql "$DATABASE_URL" -Atc "SELECT count(*) FROM chains WHERE updated_at > NOW() - INTERVAL '5 minutes' AND last_indexed_block > 0;" 2>/dev/null || echo 0)
  if [[ "$count" =~ ^[0-9]+$ ]] && (( count > 0 )); then
    pass 'Indexer has fresh chain progress in Postgres'
  else
    fail 'Indexer freshness check failed: no chain updated in the last 5 minutes'
  fi
}

check_mediator_test_escrow() {
  if [[ -z "$TEST_ESCROW_ID" ]]; then
    fail 'TEST_ESCROW_ID is required to verify mediator processed a test escrow'
    return
  fi

  local out
  out=$(mktemp)
  local code
  code=$(curl_body "${API_URL%/}/escrows/${TEST_ESCROW_ID}" "$out")
  if [[ "$code" == "200" ]] && node -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); const logs=data.mediatorLog||data.mediationLog||[]; if(!Array.isArray(logs) || !logs.some((l)=>String(l.eventType||l.step||'').includes('mediation') || String(l.message||'').toLowerCase().includes('approve'))) process.exit(1)" "$out"; then
    pass "Mediator processed test escrow ${TEST_ESCROW_ID}"
  else
    fail "Mediator test escrow ${TEST_ESCROW_ID:-<missing>} is not verified (HTTP ${code:-curl-failed})"
  fi
  rm -f "$out"
}

check_wallet_connect_surface() {
  local out
  out=$(mktemp)
  local code
  code=$(curl_body "${WEB_URL%/}/dashboard" "$out")
  if [[ "$code" == "200" ]] && grep -Eiq 'connect|wallet|rainbowkit' "$out"; then
    pass 'Wallet connect surface is present on dashboard HTML'
  else
    fail 'Wallet connect surface was not detectable on dashboard; verify modal manually in browser'
  fi
  rm -f "$out"
}

log 'Agora production smoke test'
printf 'WEB_URL=%s\nAPI_URL=%s\nGATEWAY_URL=%s\n' "$WEB_URL" "$API_URL" "${GATEWAY_URL:-<unset>}"

require_cmd curl
require_cmd node

log 'Frontend pages'
check_http_200 'Home page' "${WEB_URL%/}/"
check_http_200 'Agents page' "${WEB_URL%/}/agents"
check_http_200 'Dashboard page' "${WEB_URL%/}/dashboard"
check_http_200 'Deploy page' "${WEB_URL%/}/deploy"
check_http_200 'Leaderboard page' "${WEB_URL%/}/leaderboard"
check_http_200 'Docs page' "${WEB_URL%/}/docs"

log 'Frontend API proxies'
check_json_url '/api/stats' "${API_URL%/}/stats" "if(typeof data !== 'object' || data === null) process.exit(1);"
check_json_url '/api/agents' "${API_URL%/}/agents" "if(!(Array.isArray(data) || Array.isArray(data.agents) || Array.isArray(data.items))) process.exit(1);"

log 'Wallet UI'
check_wallet_connect_surface

log 'VM health and backend state'
check_gateway_deep_health
check_fresh_indexer
check_mediator_test_escrow
check_llm_spend_zero

if (( failures > 0 )); then
  printf '\n\033[31mSmoke test failed with %d failure(s).\033[0m\n' "$failures"
  exit 1
fi

printf '\n\033[32mSmoke test passed. Agora is ready for final manual launch checks.\033[0m\n'
