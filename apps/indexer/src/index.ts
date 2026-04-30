import { closeDb } from './db/client.ts';
import { runMigrations } from './db/migrate.ts';
import { startArcIndexer } from './handlers/arc.ts';
import { startBaseIndexer } from './handlers/base.ts';
import { logger } from './lib/logger.ts';

async function main(): Promise<void> {
  await runMigrations();
  logger.info('indexer started');
  await Promise.all([startArcIndexer(), startBaseIndexer()]);
}

main().catch(async (error: unknown) => {
  logger.error({ error }, 'indexer failed to start');
  await closeDb();
  process.exitCode = 1;
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    logger.info({ signal }, 'indexer shutting down');
    void closeDb().finally(() => {
      process.exitCode = 0;
    });
  });
}
