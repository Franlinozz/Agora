import pino from 'pino';

import { closeDb } from './db/client.ts';
import { runMigrations } from './db/migrate.ts';

const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  transport:
    process.env.NODE_ENV === 'production'
      ? undefined
      : {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
          },
        },
});

async function main(): Promise<void> {
  await runMigrations();
  logger.info('indexer started');
}

main()
  .catch((error: unknown) => {
    logger.error({ error }, 'indexer failed to start');
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
