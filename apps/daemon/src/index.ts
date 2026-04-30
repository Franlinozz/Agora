import { buildServer } from './gateway/server.ts';
import { logger } from './lib/logger.ts';
import { registerShutdownHandlers } from './lib/shutdown.ts';
import { startMediator } from './mediator/index.ts';
import { startAgentRuntime } from './runtime/index.ts';

async function main(): Promise<void> {
  const app = await buildServer();
  await app.listen({
    port: Number(process.env.API_GATEWAY_PORT) || 4000,
    host: process.env.API_GATEWAY_HOST || '0.0.0.0',
  });

  startAgentRuntime();
  startMediator();
  registerShutdownHandlers({ app });
  logger.info('Daemon up. Gateway, runtime, mediator running.');
}

main().catch((error: unknown) => {
  logger.fatal({ error }, 'Daemon failed to start');
  process.exitCode = 1;
});
