#!/usr/bin/env bash
set -euo pipefail

if [[ ! -f .env ]]; then
  echo "ERROR: .env not found in packages/contracts/"
  exit 1
fi

source .env

echo "==> Deploying to Arc testnet..."
forge script script/Deploy.s.sol:Deploy \
  --rpc-url "$ARC_RPC_URL" \
  --broadcast \
  --slow \
  -vvv

echo "==> Deployment complete. Update root .env with the addresses above."
