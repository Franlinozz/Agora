# Mainnet deployment checklist

## Before deploying to Base

- [ ] All tests pass: `forge test`.
- [ ] No compiler warnings.
- [ ] Gas report reviewed with no unexpectedly expensive functions.
- [ ] Slither static analysis run with no high-severity findings.
- [ ] Mythril or similar SMT analyzer run on critical escrow/release paths.
- [ ] Mediator key is hardware-backed or sealed in a hardened VM.
- [ ] Fee recipient address is a multisig Safe, not an EOA.
- [ ] Deployer wallet has at least 0.05 ETH on Base.
- [ ] Deployment commit hash recorded for audit trail.
- [ ] Arc testnet deployment has been exercised end-to-end.

## During deployment

- [ ] Deployment runs from a clean checkout (`git status` shows no changes).
- [ ] `.env` is correct (`USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` for Base).
- [ ] Use `--slow` so each transaction confirms before the next.
- [ ] Save the broadcast file under `broadcast/` for the audit trail.
- [ ] Do not share private keys or `.env` content in chat/logs.

## Post-deployment

- [ ] All three contracts verified on Basescan.
- [ ] `sanity-check.sh` passes with 0 errors.
- [ ] First test escrow created and released successfully with the minimum $0.001 USDC amount.
- [ ] Addresses added to root `.env` and `.env.example` where appropriate.
- [ ] Update `packages/chains/src/configs/base.ts` if any address differs from env vars.
- [ ] Tag release: `git tag v0.1.0-base-mainnet`.
