#!/usr/bin/env bash
set -euo pipefail

echo "================================================"
echo " BASE MAINNET DEPLOYMENT — REAL MONEY"
echo "================================================"
read -r -p "Have you tested on Arc testnet? (yes/no): " TESTED
[[ "$TESTED" != "yes" ]] && { echo "Test on Arc first."; exit 1; }

read -r -p "Have you run a security review? (yes/no): " REVIEWED
[[ "$REVIEWED" != "yes" ]] && { echo "Review first."; exit 1; }

read -r -p "Type 'I UNDERSTAND THIS IS REAL USDC' to continue: " CONFIRM
[[ "$CONFIRM" != "I UNDERSTAND THIS IS REAL USDC" ]] && { echo "Aborted."; exit 1; }

source .env

forge script script/Deploy.s.sol:Deploy \
  --rpc-url "$BASE_RPC_URL" \
  --broadcast \
  --verify \
  --etherscan-api-key "$BASESCAN_API_KEY" \
  --slow \
  -vvv
