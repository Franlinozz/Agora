import type { FastifyInstance } from 'fastify';

import { closeDb } from '../db/client.ts';
import { stopMediator } from '../mediator/index.ts';
import { stopAgentRuntime } from '../runtime/index.ts';

import { logger } from './logger.ts';

const SHUTDOWN_TIMEOUT_MS = 30_000;

type ShutdownOptions = {
  app: FastifyInstance;
};

let shuttingDown = false;

export function registerShutdownHandlers({ app }: ShutdownOptions): void {
  const shutdown = (signal: NodeJS.Signals) => {
    void gracefulShutdown(signal, app);
  };

  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);

  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled promise rejection');
  });

  process.on('uncaughtException', (error) => {
    logger.fatal({ error }, 'Uncaught exception');
    void gracefulShutdown('SIGTERM', app, 1);
  });
}

async function gracefulShutdown(
  signal: NodeJS.Signals,
  app: FastifyInstance,
  exitCode = 0,
): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.info({ signal }, 'Graceful shutdown started');

  const timeout = setTimeout(() => {
    logger.error({ timeoutMs: SHUTDOWN_TIMEOUT_MS }, 'Graceful shutdown timed out');
    // eslint-disable-next-line n/no-process-exit -- shutdown timeout is the last-resort container escape hatch.
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  timeout.unref();

  try {
    await app.close();
    await Promise.allSettled([stopAgentRuntime(), stopMediator()]);
    await closeDb();
    logger.info('Graceful shutdown complete');
    process.exitCode = exitCode;
  } catch (error) {
    logger.error({ error }, 'Graceful shutdown failed');
    process.exitCode = 1;
  } finally {
    clearTimeout(timeout);
  }
}
