import { logger } from '../lib/logger.ts';

import { workerLoop } from './worker.ts';

let controller: AbortController | null = null;

export function startAgentRuntime(): void {
  if (controller) return;

  controller = new AbortController();
  const workerCount = Number(process.env.AGENT_WORKER_COUNT ?? 3);

  for (let index = 0; index < workerCount; index += 1) {
    const workerId = `agent-worker-${index + 1}`;
    void workerLoop(workerId, controller.signal).catch((error: unknown) => {
      logger.error({ workerId, error }, 'Agent runtime worker crashed');
    });
  }

  logger.info({ workerCount }, 'Agent runtime worker pool initialized');
}

export function stopAgentRuntime(): void {
  controller?.abort();
  controller = null;
}
