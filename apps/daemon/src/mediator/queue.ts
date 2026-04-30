import { eq, sql as drizzleSql } from 'drizzle-orm';

import { db } from '../db/client.ts';
import { escrows, mediationLogs, mediationQueue } from '../db/schema.ts';

export type MediationJob = typeof mediationQueue.$inferSelect;

export async function claimNextMediationJob(workerId: string): Promise<MediationJob | null> {
  const rows = await db.execute(drizzleSql<MediationJob>`
    UPDATE mediation_queue
    SET status = 'running',
        worker_id = ${workerId},
        claimed_at = NOW(),
        attempts = attempts + 1,
        updated_at = NOW()
    WHERE pk = (
      SELECT pk
      FROM mediation_queue
      WHERE status = 'pending'
         OR (status = 'running' AND claimed_at < NOW() - INTERVAL '5 minutes')
      ORDER BY created_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    RETURNING *
  `);

  return (rows[0] as MediationJob | undefined) ?? null;
}

export async function loadEscrow(escrowPk: number): Promise<typeof escrows.$inferSelect> {
  const escrow = await db.query.escrows.findFirst({ where: eq(escrows.pk, escrowPk) });
  if (!escrow) throw new Error(`Escrow ${escrowPk} not found`);
  return escrow;
}

export async function markMediationCompleted(
  job: MediationJob,
  resultPayload: unknown,
  message: string,
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .update(mediationQueue)
      .set({ status: 'completed', resultPayload, error: null, updatedAt: new Date() })
      .where(eq(mediationQueue.pk, job.pk));

    await tx.insert(mediationLogs).values({
      escrowPk: job.escrowPk,
      queuePk: job.pk,
      eventType: 'ai_mediation_completed',
      message,
      metadata: resultPayload,
    });
  });
}

export async function markMediationFailed(job: MediationJob, error: string): Promise<void> {
  await db
    .update(mediationQueue)
    .set({ status: 'failed', error, updatedAt: new Date() })
    .where(eq(mediationQueue.pk, job.pk));
}

export async function requeueMediation(job: MediationJob, error: string): Promise<void> {
  await db
    .update(mediationQueue)
    .set({
      status: 'pending',
      error,
      workerId: null,
      claimedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(mediationQueue.pk, job.pk));
}
