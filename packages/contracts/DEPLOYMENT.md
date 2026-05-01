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
4. Set `ARC_RPC_URL=https://rpc.testnet.arc.network`.
5. Set `USDC_ADDRESS=0x3600000000000000000000000000000000000000` for Arc's ERC-20 USDC interface.
6. Set `ERC6551_REGISTRY=0x000000006551c19487814612e58FE06813775758` if its bytecode is still present on Arc.
7. Set `MEDIATOR_ADDRESS` and `FEE_RECIPIENT` to the real operational wallets.
8. Run the Arc deploy script. It deploys `ERC6551Account`, `AgentRegistry`, `ReputationOracle`, and `EscrowManager` in one broadcast.

## Arc testnet network constants

- Chain ID: `5042002` (`0x4CEF52`)
- RPC: `https://rpc.testnet.arc.network`
- Explorer: `https://testnet.arcscan.app`
- USDC ERC-20 interface: `0x3600000000000000000000000000000000000000` with 6 decimals
- Canonical ERC-6551 registry: `0x000000006551c19487814612e58FE06813775758`

## ERC-6551 account implementation

Agora still needs an `ERC6551_ACCOUNT_IMPL` address. The Arc deploy script deploys the reference
`ERC6551Account` from `erc6551/examples/simple/ERC6551Account.sol` once and passes it into
`AgentRegistry`. The canonical registry can then create token-bound accounts pointing at that
implementation.

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

The deployer wallet must have Arc testnet USDC because Arc uses USDC as gas.

## Post-deployment verification

1. Copy printed `AGENT_REGISTRY`, `ESCROW_MANAGER`, and `REPUTATION_ORACLE` addresses into `packages/contracts/.env` and root `.env`.
2. Set `RPC_URL=$ARC_RPC_URL`.
3. Run `./scripts/sanity-check.sh`.
4. Run `forge script script/Verify.s.sol:Verify --rpc-url "$ARC_RPC_URL"`.
5. Update `packages/chains/src/configs/arc.ts` env values or deployment environment variables.
6. Commit deployment metadata only after reviewing that no private keys or secrets are included.
