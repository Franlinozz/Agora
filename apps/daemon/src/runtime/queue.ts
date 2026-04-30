import { eq, sql as drizzleSql } from 'drizzle-orm';

import { db } from '../db/client.ts';
import { agentTasks, mediationQueue } from '../db/schema.ts';

type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';

export type AgentTask = typeof agentTasks.$inferSelect;

export async function enqueueTask(
  agentPk: number,
  escrowPk: number,
  input: unknown,
): Promise<AgentTask> {
  const [task] = await db
    .insert(agentTasks)
    .values({ agentPk, escrowPk, inputPayload: input, status: 'pending' satisfies TaskStatus })
    .returning();

  if (!task) throw new Error('Failed to enqueue agent task');
  return task;
}

export async function claimNextTask(workerId: string): Promise<AgentTask | null> {
  const rows = await db.execute(drizzleSql<AgentTask>`
    UPDATE agent_tasks
    SET status = 'running',
        worker_id = ${workerId},
        claimed_at = NOW(),
        attempts = attempts + 1,
        updated_at = NOW()
    WHERE pk = (
      SELECT pk
      FROM agent_tasks
      WHERE status = 'pending'
         OR (status = 'running' AND claimed_at < NOW() - INTERVAL '5 minutes')
      ORDER BY created_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    RETURNING *
  `);

  return (rows[0] as AgentTask | undefined) ?? null;
}

export async function markCompleted(taskId: number, output: unknown): Promise<void> {
  await db
    .update(agentTasks)
    .set({ status: 'completed', outputPayload: output, error: null, updatedAt: new Date() })
    .where(eq(agentTasks.pk, taskId));
}

export async function markFailed(taskId: number, error: string): Promise<void> {
  await db
    .update(agentTasks)
    .set({ status: 'failed', error, updatedAt: new Date() })
    .where(eq(agentTasks.pk, taskId));
}

export async function requeueTask(taskId: number, error: string): Promise<void> {
  await db
    .update(agentTasks)
    .set({ status: 'pending', error, workerId: null, claimedAt: null, updatedAt: new Date() })
    .where(eq(agentTasks.pk, taskId));
}

export async function enqueueMediation(escrowPk: number, deliveryPayload: unknown): Promise<void> {
  await db
    .insert(mediationQueue)
    .values({ escrowPk, deliveryPayload, status: 'pending' })
    .onConflictDoNothing();
}
