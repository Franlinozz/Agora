# Contracts deployment guide

## Pre-deployment checklist

- Run `forge fmt --check`.
- Run `forge build` and confirm there are no compiler warnings.
- Run `forge test -vv` and confirm all tests pass.
- Run `forge test --gas-report` and review deployment and critical-path gas.
- Review ownership, mediator, fee recipient, and USDC addresses before broadcasting.
- Confirm `.env` is local-only and never committed.

## Arc testnet deployer setup

1. Create a dedicated deployer wallet.
2. Fund it with Arc testnet gas from the official faucet when available.
3. Add the private key to `packages/contracts/.env` as `DEPLOYER_PRIVATE_KEY`.
4. Set `ARC_RPC_URL`, `USDC_ADDRESS`, `ERC6551_REGISTRY`, `ERC6551_ACCOUNT_IMPL`, `MEDIATOR_ADDRESS`, and `FEE_RECIPIENT`.

## ERC-6551 registry addresses

Use the canonical ERC-6551 registry if Arc publishes one. If Arc does not yet have a registry,
deploy the reference `ERC6551Registry` from `erc6551/reference` and use that deployed address as
`ERC6551_REGISTRY`. Deploy `ERC6551Account` and use it as `ERC6551_ACCOUNT_IMPL`.

## Dry run

Before broadcasting, run:

```bash
cd packages/contracts
forge script script/Deploy.s.sol:Deploy --fork-url "$ARC_RPC_URL" -vvv
```

## Broadcast to Arc testnet

```bash
cd packages/contracts
./scripts/deploy-arc.sh
```

## Post-deployment verification

1. Copy printed `AGENT_REGISTRY`, `ESCROW_MANAGER`, and `REPUTATION_ORACLE` addresses into `packages/contracts/.env` and root `.env`.
2. Set `RPC_URL=$ARC_RPC_URL`.
3. Run `./scripts/sanity-check.sh`.
4. Run `forge script script/Verify.s.sol:Verify --rpc-url "$ARC_RPC_URL"`.
5. Update `packages/chains/src/configs/arc.ts` env values or deployment environment variables.
6. Commit deployment metadata only after reviewing that no private keys or secrets are included.
