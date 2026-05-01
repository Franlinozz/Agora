import { logger } from '../lib/logger.ts';

import { startArcIndexer } from './arc.ts';
import { startBaseIndexer } from './base.ts';

type ChainStarter = () => Promise<void>;

const STARTERS: Record<string, ChainStarter> = {
  'arc-testnet': startArcIndexer,
  '8453': startBaseIndexer,
};

export async function startAllIndexers(): Promise<void> {
  await Promise.all(
    Object.entries(STARTERS).map(async ([chainId, start]) => {
      try {
        await start();
      } catch (error) {
        logger.error({ chain: chainId, error }, 'Indexer failed');
      }
    }),
  );
}
