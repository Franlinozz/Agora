import { ACTIVE_CHAINS } from '@agora/chains';
import { count, eq, sql as drizzleSql } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';

import { db } from '../../db/client.ts';
import { agentTasks, mediationQueue } from '../../db/schema.ts';
import { serializeJson } from '../../lib/json.ts';
import { currentSpend } from '../../mediator/spend.ts';

type Check = {
  ok: boolean;
  message?: string;
  latencyMs?: number;
  details?: unknown;
};

export default async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async () => ({ ok: true }));

  app.get('/health/deep', async (_request, reply) => {
    const started = Date.now();
    const [postgres, queues, llmSpend, chains] = await Promise.all([
      checkPostgres(),
      checkQueues(),
      checkLlmSpend(),
      checkChains(),
    ]);

    const checks = { postgres, queues, llmSpend, chains };
    const ok = Object.values(checks).every((check) => check.ok);

    if (!ok) reply.code(503);
    return serializeJson({ ok, latencyMs: Date.now() - started, checks });
  });
}

async function checkPostgres(): Promise<Check> {
  const started = Date.now();
  try {
    await db.execute(drizzleSql`SELECT 1`);
    return { ok: true, latencyMs: Date.now() - started };
  } catch (error) {
    return { ok: false, latencyMs: Date.now() - started, message: errorMessage(error) };
  }
}

async function checkQueues(): Promise<Check> {
  const started = Date.now();
  try {
    const [pendingTasks] = await db
      .select({ count: count() })
      .from(agentTasks)
      .where(eq(agentTasks.status, 'pending'));
    const [pendingMediations] = await db
      .select({ count: count() })
      .from(mediationQueue)
      .where(eq(mediationQueue.status, 'pending'));
    const [oldestTask] = await db.execute<{ age_seconds: number | null }>(drizzleSql`
      SELECT EXTRACT(EPOCH FROM (NOW() - MIN(created_at)))::int AS age_seconds
      FROM agent_tasks
      WHERE status = 'pending'
    `);
    const [oldestMediation] = await db.execute<{ age_seconds: number | null }>(drizzleSql`
      SELECT EXTRACT(EPOCH FROM (NOW() - MIN(created_at)))::int AS age_seconds
      FROM mediation_queue
      WHERE status = 'pending'
    `);

    return {
      ok: true,
      latencyMs: Date.now() - started,
      details: {
        pendingAgentTasks: pendingTasks?.count ?? 0,
        pendingMediations: pendingMediations?.count ?? 0,
        oldestPendingAgentTaskSeconds: oldestTask?.age_seconds ?? null,
        oldestPendingMediationSeconds: oldestMediation?.age_seconds ?? null,
      },
    };
  } catch (error) {
    return { ok: false, latencyMs: Date.now() - started, message: errorMessage(error) };
  }
}

async function checkLlmSpend(): Promise<Check> {
  const started = Date.now();
  try {
    const spend = await currentSpend();
    return {
      ok: spend.centsSpent <= spend.capCents,
      latencyMs: Date.now() - started,
      details: { ...spend, remainingCents: Math.max(0, spend.capCents - spend.centsSpent) },
    };
  } catch (error) {
    return { ok: false, latencyMs: Date.now() - started, message: errorMessage(error) };
  }
}

async function checkChains(): Promise<Check> {
  const started = Date.now();
  const chainChecks = await Promise.all(
    ACTIVE_CHAINS.map(async (chain) => {
      const rpcUrl = chain.rpcUrl;
      if (!rpcUrl || !rpcUrl.startsWith('http')) {
        return { id: chain.name, ok: false, message: 'No HTTP RPC URL configured' };
      }

      const result = await checkRpc(rpcUrl);
      return { id: chain.name, ...result };
    }),
  );

  return {
    ok: chainChecks.every((check) => check.ok),
    latencyMs: Date.now() - started,
    details: chainChecks,
  };
}

async function checkRpc(
  rpcUrl: string,
): Promise<{ ok: boolean; message?: string; blockNumber?: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);

  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] }),
      signal: controller.signal,
    });

    if (!response.ok) return { ok: false, message: `RPC HTTP ${response.status}` };
    const json = (await response.json()) as { result?: string; error?: { message?: string } };
    if (!json.result) return { ok: false, message: json.error?.message ?? 'Missing block number' };
    return { ok: true, blockNumber: json.result };
  } catch (error) {
    return { ok: false, message: errorMessage(error) };
  } finally {
    clearTimeout(timeout);
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
