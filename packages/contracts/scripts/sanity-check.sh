#!/usr/bin/env bash
set -euo pipefail
source .env

echo "==> AgentRegistry total agents:"
cast call "$AGENT_REGISTRY" "totalAgents()(uint256)" --rpc-url "$RPC_URL"

echo "==> EscrowManager USDC token:"
cast call "$ESCROW_MANAGER" "usdc()(address)" --rpc-url "$RPC_URL"

echo "==> EscrowManager mediator:"
cast call "$ESCROW_MANAGER" "mediator()(address)" --rpc-url "$RPC_URL"

echo "==> ReputationOracle escrow manager:"
cast call "$REPUTATION_ORACLE" "escrowManager()(address)" --rpc-url "$RPC_URL"
