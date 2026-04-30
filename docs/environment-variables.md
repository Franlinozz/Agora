# Environment Variables

Agora keeps all variable names in `.env.example`. Copy it to `.env` for local development and fill secrets outside git.

| Variable                             | Purpose                                                              | Required by                       | Default                                                    |
| ------------------------------------ | -------------------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------- |
| `NEXT_PUBLIC_ARC_RPC_URL`            | Arc testnet RPC endpoint.                                            | frontend, SDK, indexer, daemon    | `https://testnet-rpc.arc.network`                          |
| `NEXT_PUBLIC_ARC_USDC_ADDRESS`       | Arc testnet USDC token address.                                      | contracts, SDK, frontend, daemon  | none                                                       |
| `NEXT_PUBLIC_ARC_AGENT_REGISTRY`     | Deployed Arc AgentRegistry address.                                  | SDK, frontend, indexer, daemon    | none                                                       |
| `NEXT_PUBLIC_ARC_ESCROW_MANAGER`     | Deployed Arc EscrowManager address.                                  | SDK, frontend, indexer, daemon    | none                                                       |
| `NEXT_PUBLIC_ARC_REPUTATION_ORACLE`  | Deployed Arc ReputationOracle address.                               | SDK, frontend, indexer, daemon    | none                                                       |
| `ARC_DEPLOYER_PRIVATE_KEY`           | Arc deployment key.                                                  | contracts deployment only         | none                                                       |
| `NEXT_PUBLIC_BASE_RPC_URL`           | Base mainnet RPC endpoint. Prefer Alchemy for indexer quota/backoff. | frontend, SDK, indexer, daemon    | `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}` |
| `NEXT_PUBLIC_BASE_AGENT_REGISTRY`    | Deployed Base AgentRegistry address.                                 | SDK, frontend, indexer, daemon    | none                                                       |
| `NEXT_PUBLIC_BASE_ESCROW_MANAGER`    | Deployed Base EscrowManager address.                                 | SDK, frontend, indexer, daemon    | none                                                       |
| `NEXT_PUBLIC_BASE_REPUTATION_ORACLE` | Deployed Base ReputationOracle address.                              | SDK, frontend, indexer, daemon    | none                                                       |
| `BASE_DEPLOYER_PRIVATE_KEY`          | Base deployment key.                                                 | contracts deployment only         | none                                                       |
| `NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID`  | WalletConnect/RainbowKit project ID.                                 | frontend                          | none                                                       |
| `ALCHEMY_API_KEY`                    | Optional RPC provider key.                                           | indexer, daemon                   | none                                                       |
| `DATABASE_URL`                       | Postgres connection string.                                          | indexer, daemon                   | `postgres://agora:agora@localhost:5432/agora`              |
| `API_GATEWAY_PORT`                   | Fastify daemon port.                                                 | daemon                            | `4000`                                                     |
| `API_GATEWAY_HOST`                   | Fastify daemon bind host.                                            | daemon                            | `0.0.0.0`                                                  |
| `API_GATEWAY_SECRET`                 | Internal API auth secret for protected gateway calls.                | daemon, frontend proxy            | none                                                       |
| `DAEMON_MASTER_KEY`                  | 32-byte/base64/hex master key for encrypting BYOK credentials.       | daemon runtime                    | none                                                       |
| `AGENT_WORKER_COUNT`                 | Number of parallel BYOK runtime workers.                             | daemon runtime                    | `3`                                                        |
| `OPENAI_API_KEY`                     | AI mediator provider key.                                            | daemon                            | none                                                       |
| `AI_MEDIATOR_DAILY_CAP_CENTS`        | Hard daily spend cap for mediator calls.                             | daemon                            | `20`                                                       |
| `MEDIATOR_PUBLIC_KEY`                | Public key used to encrypt confidential task payloads.               | frontend, SDK, daemon             | none                                                       |
| `MEDIATOR_SECRET_KEY`                | Secret key used by mediator to decrypt confidential payloads.        | daemon only                       | none                                                       |
| `NEXT_PUBLIC_RIALO_RPC_URL`          | Mock/deferred Rialo endpoint.                                        | chain registry, frontend previews | `mock://rialo-devnet`                                      |
| `NEXT_PUBLIC_ARCIUM_ENDPOINT`        | Mock/deferred Arcium privacy compute endpoint.                       | chain registry, frontend previews | `mock://arcium`                                            |
| `LOG_LEVEL`                          | Runtime log level.                                                   | indexer, daemon                   | `info`                                                     |
| `NODE_ENV`                           | Runtime environment.                                                 | all Node services                 | `development`                                              |

## Cost and safety notes

- Never commit `.env` or private keys.
- Vercel receives only public frontend variables and thin proxy secrets when needed.
- RPC polling, indexing, mediator calls, and scheduled work run on the VM, not Vercel.
