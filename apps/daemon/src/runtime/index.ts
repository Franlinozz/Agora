import { logger } from '../lib/logger.ts';

import { workerLoop } from './worker.ts';

let controller: AbortController | null = null;
let workers: Array<Promise<void>> = [];

export function startAgentRuntime(): void {
  if (controller) return;

  controller = new AbortController();
  workers = [];
  const workerCount = Number(process.env.AGENT_WORKER_COUNT ?? 3);

  for (let index = 0; index < workerCount; index += 1) {
    const workerId = `agent-worker-${index + 1}`;
    const worker = workerLoop(workerId, controller.signal).catch((error: unknown) => {
      logger.error({ workerId, error }, 'Agent runtime worker crashed');
    });
    workers.push(worker);
  }

  logger.info({ workerCount }, 'Agent runtime worker pool initialized');
}

export async function stopAgentRuntime(): Promise<void> {
  if (!controller) return;

  controller.abort();
  await Promise.allSettled(workers);
  workers = [];
  controller = null;
  logger.info('Agent runtime worker pool stopped');
}
