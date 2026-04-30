import { logger } from '../lib/logger.ts';

import { mediateDelivery } from './ai.ts';
import {
  claimNextMediationJob,
  loadEscrow,
  markMediationCompleted,
  markMediationFailed,
  requeueMediation,
  type MediationJob,
} from './queue.ts';

const MAX_ATTEMPTS = 3;

let controller: AbortController | null = null;

export function startMediator(): void {
  if (controller) return;

  controller = new AbortController();
  const workerCount = Number(process.env.MEDIATOR_WORKER_COUNT ?? 1);

  for (let index = 0; index < workerCount; index += 1) {
    const workerId = `mediator-worker-${index + 1}`;
    void mediatorLoop(workerId, controller.signal).catch((error: unknown) => {
      logger.error({ workerId, error }, 'Mediator worker crashed');
    });
  }

  logger.info(
    { workerCount, dailyCapCents: process.env.AI_MEDIATOR_DAILY_CAP_CENTS ?? 20 },
    'AI mediator worker pool initialized',
  );
}

export function stopMediator(): void {
  controller?.abort();
  controller = null;
}

async function mediatorLoop(workerId: string, signal?: AbortSignal): Promise<void> {
  while (!signal?.aborted) {
    const job = await claimNextMediationJob(workerId);
    if (!job) {
      await sleep(3_000, signal);
      continue;
    }

    await processJob(workerId, job);
  }
}

async function processJob(workerId: string, job: MediationJob): Promise<void> {
  const started = Date.now();

  try {
    const escrow = await loadEscrow(job.escrowPk);
    const decision = await mediateDelivery({ escrow, deliveryPayload: job.deliveryPayload });

    await markMediationCompleted(
      job,
      decision,
      `${decision.decision}: ${decision.buyerVisibleSummary}`,
    );

    logger.info(
      {
        workerId,
        mediationJobPk: job.pk,
        escrowPk: job.escrowPk,
        decision: decision.decision,
        latencyMs: Date.now() - started,
      },
      'Mediation job completed',
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (job.attempts < MAX_ATTEMPTS) {
      await requeueMediation(job, message);
      logger.warn(
        { workerId, mediationJobPk: job.pk, attempt: job.attempts, error },
        'Mediation job requeued',
      );
      return;
    }

    await markMediationFailed(job, message);
    logger.error({ workerId, mediationJobPk: job.pk, error }, 'Mediation job failed');
  }
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal?.aborted) return resolve();
    const timeout = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timeout);
        resolve();
      },
      { once: true },
    );
  });
}
