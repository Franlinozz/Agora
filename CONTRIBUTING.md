# Contributing to Agora

Thanks for helping improve Agora. This repo spans Solidity contracts, a TypeScript SDK, a Next.js app, an indexer, and a daemon backend, so changes should be small, well-tested, and security-conscious.

## Ways to contribute

- File bugs with reproduction steps.
- Improve docs, examples, and runbooks.
- Add tests for contracts, SDK behavior, or backend flows.
- Fix focused issues without broad rewrites.
- Propose product changes with clear user value.

## Before opening a PR

1. Search existing issues/PRs.
2. Keep the change scoped to one problem.
3. Avoid unrelated formatting churn.
4. Do not commit secrets, `.env`, private keys, RPC credentials, deployer wallets, API tokens, or database dumps.
5. If the change touches money movement, escrow state, mediator decisions, credentials, or deployment automation, explain the risk model in the PR.

## Development setup

```bash
pnpm install --frozen-lockfile
cp .env.example .env
pnpm typecheck
pnpm lint
pnpm build
```

Contracts:

```bash
cd packages/contracts
forge build
forge test -vv
```

## Code style

- TypeScript is strict; prefer explicit types at package boundaries.
- Follow existing module patterns and import style.
- Keep Vercel API routes thin stateless proxies only.
- Keep VM services responsible for DB, RPC, queues, cron-like work, and LLM calls.
- Validate external input with Zod or equivalent schema checks.
- Prefer simple reliable code over clever abstractions.

## Testing expectations

Run the smallest relevant checks before opening a PR:

- Frontend: `pnpm --filter @agora/web typecheck && pnpm --filter @agora/web lint && pnpm --filter @agora/web build`
- Daemon: `pnpm --filter @agora/daemon typecheck && pnpm --filter @agora/daemon lint && pnpm --filter @agora/daemon build`
- Indexer: `pnpm --filter @agora/indexer typecheck && pnpm --filter @agora/indexer lint && pnpm --filter @agora/indexer build`
- Contracts: `pnpm --filter @agora/contracts test`
- Full repo: `pnpm typecheck && pnpm lint && pnpm build`

If you cannot run a check, say why in the PR.

## Pull request checklist

- [ ] The PR describes what changed and why.
- [ ] Tests or verification commands are listed.
- [ ] No secrets or generated private artifacts are committed.
- [ ] User-facing behavior is documented.
- [ ] Deployment/env changes are reflected in docs.
- [ ] Contract changes include tests and gas impact notes.
- [ ] Backend changes preserve cost controls and failure handling.

## Commit style

Use concise imperative commit messages, for example:

- `feat: add escrow dispute view`
- `fix: retry rpc reads with backoff`
- `docs: expand vm restore runbook`
- `ci: add contracts gas report workflow`

## Sign-off

By contributing, you agree that your contribution can be distributed under this repository's license.
