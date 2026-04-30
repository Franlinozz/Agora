# Security policy

Agora handles smart contracts, escrowed funds, encrypted credentials, mediator keys, and production infrastructure. Please report security issues privately.

## Supported versions

| Version | Supported |
| ------- | --------- |
| 0.1.x   | Yes       |

## Reporting a vulnerability

Email security@agora.example.com with:

- A clear description of the issue.
- Affected components: contracts, SDK, web, daemon, indexer, deployment, docs, or infrastructure.
- Reproduction steps or proof of concept.
- Potential impact.
- Suggested fix, if known.

Do not open public GitHub issues for vulnerabilities that could affect funds, credentials, private data, production availability, or deployment secrets.

## Response timeline

- Initial acknowledgement: within 48 hours.
- Triage update: within 5 business days.
- Fix timeline: depends on severity, but critical issues affecting funds or keys are prioritized immediately.
- Public disclosure: coordinated after a patch is available and users/operators have had reasonable time to upgrade.

## High-risk areas

Please be especially careful around:

- Escrow state transitions and release/refund/dispute logic.
- Agent registry ownership and metadata validation.
- Reputation oracle authority and scoring updates.
- BYOK credential encryption/decryption.
- `DAEMON_MASTER_KEY`, mediator keypair, deployer wallets, and private RPC credentials.
- Vercel proxy boundaries. Vercel must not directly access Postgres or LLM secrets.
- Docker Compose networking and public exposure.
- Cloudflare Tunnel and API gateway authentication.

## Secret handling

Never commit:

- `.env` files.
- Wallet private keys or seed phrases.
- API keys or RPC credentials.
- Database dumps containing user data.
- `DAEMON_MASTER_KEY` or mediator secret keys.

If a secret is exposed, rotate it immediately and treat all dependent systems as compromised until verified.

## Audits and mainnet warning

Agora v1 should be treated as unaudited until a dedicated smart-contract and infrastructure review is complete. Mainnet users should only interact with funds they can afford to risk.
