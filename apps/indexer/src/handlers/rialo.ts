import { logger } from '../lib/logger.ts';

const RIALO_CHAIN_ID = 'rialo-devnet';

export async function startRialoIndexer(): Promise<void> {
  logger.info(
    { chain: RIALO_CHAIN_ID },
    'Rialo indexer in mock mode (no-op). Will activate when devnet is public.',
  );

  // When Rialo is ready, this function will:
  // 1. Connect to Rialo RPC via @rialo-labs/sdk (or whatever client they ship).
  // 2. Subscribe to AgentRegistry / EscrowManager equivalents.
  // 3. Reuse handlers/shared.ts where possible for compatible event shapes.
  // 4. Insert into Postgres tables with chain_id = 'rialo-devnet'.
}
