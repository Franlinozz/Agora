import { getAgent, getEscrow, getReputation, weightedScore } from '@agora/sdk';
import { EscrowState } from '@agora/shared';
import { and, eq } from 'drizzle-orm';
import type { Hash, Log } from 'viem';

import { db } from '../db/client.ts';
import { agents, escrows, events, reputations } from '../db/schema.ts';
import { logger } from '../lib/logger.ts';

type EventLog = Log & {
  eventName?: string;
  args?: unknown;
  removed?: boolean;
};

type AgentMetadata = {
  name?: string;
  description?: string;
};

export async function handleAgentDeployed(chainId: string, log: EventLog): Promise<void> {
  if (await skipRemoved(log)) return;

  const args = requireArgs(log);
  const agentId = asBigInt(args.agentId, 'agentId');
  const metadataURI = asString(args.metadataURI, 'metadataURI');
  const metadata = parseMetadata(metadataURI);
  const agent = await getAgent(chainId, agentId);

  await db
    .insert(agents)
    .values({
      chainId,
      onchainId: agentId,
      deployer: String(args.deployer),
      tba: String(args.tba),
      metadataURI,
      name: metadata.name ?? agent?.name ?? null,
      description: metadata.description ?? agent?.description ?? null,
      capabilityHash: agent?.capabilityHash ?? zeroHash(),
      pricePerCallUsdc: agent?.pricePerCallUsdc ?? 0n,
      active: true,
      deployTxHash: txHash(log),
      deployBlock: blockNumber(log),
      createdAt: eventTimestamp(log),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [agents.chainId, agents.onchainId],
      set: {
        deployer: String(args.deployer),
        tba: String(args.tba),
        metadataURI,
        name: metadata.name ?? agent?.name ?? null,
        description: metadata.description ?? agent?.description ?? null,
        capabilityHash: agent?.capabilityHash ?? zeroHash(),
        pricePerCallUsdc: agent?.pricePerCallUsdc ?? 0n,
        active: true,
        deployTxHash: txHash(log),
        deployBlock: blockNumber(log),
        updatedAt: new Date(),
      },
    });

  await insertEvent(chainId, log);
}

export async function handleAgentPriceUpdated(chainId: string, log: EventLog): Promise<void> {
  if (await skipRemoved(log)) return;

  const args = requireArgs(log);
  await db
    .update(agents)
    .set({ pricePerCallUsdc: asBigInt(args.newPrice, 'newPrice'), updatedAt: new Date() })
    .where(
      and(eq(agents.chainId, chainId), eq(agents.onchainId, asBigInt(args.agentId, 'agentId'))),
    );

  await insertEvent(chainId, log);
}

export async function handleEscrowCreated(chainId: string, log: EventLog): Promise<void> {
  if (await skipRemoved(log)) return;

  const args = requireArgs(log);
  const escrowId = asBigInt(args.escrowId, 'escrowId');
  const agentId = asBigInt(args.agentId, 'agentId');
  const agentPk = await findAgentPk(chainId, agentId);
  const escrow = await getEscrow(chainId, escrowId);

  await db
    .insert(escrows)
    .values({
      chainId,
      onchainId: escrowId,
      agentPk,
      buyer: String(args.buyer),
      amountUsdc: escrow?.amountUsdc ?? asBigInt(args.amount, 'amount'),
      taskHash: escrow?.taskHash ?? zeroHash(),
      deliveryHash: escrow?.deliveryHash ?? null,
      state: escrow?.state ?? EscrowState.Created,
      confidential: escrow?.confidential ?? Boolean(args.confidential),
      deadline: escrow?.deadline ?? eventTimestamp(log),
      createTxHash: txHash(log),
      createBlock: blockNumber(log),
      createdAt: eventTimestamp(log),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [escrows.chainId, escrows.onchainId],
      set: {
        agentPk,
        buyer: String(args.buyer),
        amountUsdc: escrow?.amountUsdc ?? asBigInt(args.amount, 'amount'),
        taskHash: escrow?.taskHash ?? zeroHash(),
        deliveryHash: escrow?.deliveryHash ?? null,
        state: escrow?.state ?? EscrowState.Created,
        confidential: escrow?.confidential ?? Boolean(args.confidential),
        deadline: escrow?.deadline ?? eventTimestamp(log),
        updatedAt: new Date(),
      },
    });

  await insertEvent(chainId, log);
}

export async function handleEscrowFunded(chainId: string, log: EventLog): Promise<void> {
  await updateEscrowState(chainId, log, EscrowState.Funded);
}

export async function handleDeliverySubmitted(chainId: string, log: EventLog): Promise<void> {
  if (await skipRemoved(log)) return;

  const args = requireArgs(log);
  await db
    .update(escrows)
    .set({
      state: EscrowState.Delivered,
      deliveryHash: String(args.deliveryHash),
      updatedAt: new Date(),
    })
    .where(
      and(eq(escrows.chainId, chainId), eq(escrows.onchainId, asBigInt(args.escrowId, 'escrowId'))),
    );

  await insertEvent(chainId, log);
}

export async function handleEscrowReleased(chainId: string, log: EventLog): Promise<void> {
  await updateEscrowState(chainId, log, EscrowState.Released);
}

export async function handleEscrowDisputed(chainId: string, log: EventLog): Promise<void> {
  await updateEscrowState(chainId, log, EscrowState.Disputed);
}

export async function handleEscrowRefunded(chainId: string, log: EventLog): Promise<void> {
  await updateEscrowState(chainId, log, EscrowState.Refunded);
}

export async function handleEscrowVerified(chainId: string, log: EventLog): Promise<void> {
  await updateEscrowState(chainId, log, EscrowState.Verified);
}

export async function handleReputationUpdated(chainId: string, log: EventLog): Promise<void> {
  if (await skipRemoved(log)) return;

  const args = requireArgs(log);
  const agentId = asBigInt(args.agentId, 'agentId');
  const agentPk = await findAgentPk(chainId, agentId);

  if (!agentPk) {
    logger.warn(
      { chain: chainId, agentId: agentId.toString() },
      'reputation update skipped: agent missing',
    );
    await insertEvent(chainId, log);
    return;
  }

  const reputation = await getReputation(chainId, agentId).catch(() => null);
  const score = await weightedScore(chainId, agentId).catch(() => 0n);

  await db
    .insert(reputations)
    .values({
      agentPk,
      completedTasks: reputation?.completedTasks ?? asNumber(args.completed, 'completed'),
      disputedTasks: reputation?.disputedTasks ?? asNumber(args.disputed, 'disputed'),
      averageRatingBps: asNumber(args.averageRating, 'averageRating'),
      totalEarningsUsdc:
        reputation?.totalEarningsUsdc ?? asBigInt(args.totalEarnings, 'totalEarnings'),
      weightedScore: score,
      lastUpdated: reputation?.lastUpdated ?? eventTimestamp(log),
    })
    .onConflictDoUpdate({
      target: reputations.agentPk,
      set: {
        completedTasks: reputation?.completedTasks ?? asNumber(args.completed, 'completed'),
        disputedTasks: reputation?.disputedTasks ?? asNumber(args.disputed, 'disputed'),
        averageRatingBps: asNumber(args.averageRating, 'averageRating'),
        totalEarningsUsdc:
          reputation?.totalEarningsUsdc ?? asBigInt(args.totalEarnings, 'totalEarnings'),
        weightedScore: score,
        lastUpdated: reputation?.lastUpdated ?? eventTimestamp(log),
      },
    });

  await insertEvent(chainId, log);
}

async function updateEscrowState(
  chainId: string,
  log: EventLog,
  state: EscrowState,
): Promise<void> {
  if (await skipRemoved(log)) return;

  const args = requireArgs(log);
  await db
    .update(escrows)
    .set({ state, updatedAt: new Date() })
    .where(
      and(eq(escrows.chainId, chainId), eq(escrows.onchainId, asBigInt(args.escrowId, 'escrowId'))),
    );

  await insertEvent(chainId, log);
}

async function insertEvent(chainId: string, log: EventLog): Promise<void> {
  await db
    .insert(events)
    .values({
      chainId,
      blockNumber: blockNumber(log),
      txHash: txHash(log),
      logIndex: Number(log.logIndex ?? 0),
      contractAddress: String(log.address).toLowerCase(),
      eventName: log.eventName ?? 'Unknown',
      args: normalizeJson(log.args ?? {}),
      confirmations: initialConfirmations(chainId),
      confirmed: chainId !== '8453',
      timestamp: eventTimestamp(log),
    })
    .onConflictDoNothing();
}

async function findAgentPk(chainId: string, agentId: bigint): Promise<number | null> {
  const row = await db.query.agents.findFirst({
    where: and(eq(agents.chainId, chainId), eq(agents.onchainId, agentId)),
    columns: { pk: true },
  });

  return row?.pk ?? null;
}

async function skipRemoved(log: EventLog): Promise<boolean> {
  if (!log.removed) return false;
  logger.warn(
    { txHash: log.transactionHash, logIndex: log.logIndex },
    'reorg log removed; rollback deferred',
  );
  return true;
}

function requireArgs(log: EventLog): Record<string, unknown> {
  if (!log.args || Array.isArray(log.args) || typeof log.args !== 'object') {
    throw new Error(`Missing decoded args for ${log.eventName ?? 'unknown event'}`);
  }

  return log.args as Record<string, unknown>;
}

function asBigInt(value: unknown, name: string): bigint {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number' || typeof value === 'string') return BigInt(value);
  throw new Error(`Expected ${name} to be bigint-compatible`);
}

function asNumber(value: unknown, name: string): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'bigint') return Number(value);
  if (typeof value === 'string') return Number(value);
  throw new Error(`Expected ${name} to be number-compatible`);
}

function asString(value: unknown, name: string): string {
  if (typeof value === 'string') return value;
  throw new Error(`Expected ${name} to be a string`);
}

function blockNumber(log: EventLog): bigint {
  return log.blockNumber ?? 0n;
}

function txHash(log: EventLog): Hash {
  return (log.transactionHash ?? zeroHash()) as Hash;
}

function initialConfirmations(chainId: string): number {
  return chainId === '8453' ? 0 : 1;
}

function eventTimestamp(_log: EventLog): Date {
  return new Date();
}

function zeroHash(): Hash {
  return `0x${'0'.repeat(64)}` as Hash;
}

function parseMetadata(metadataURI: string): AgentMetadata {
  try {
    if (!metadataURI.startsWith('data:application/json;base64,')) return {};
    const raw = Buffer.from(
      metadataURI.replace('data:application/json;base64,', ''),
      'base64',
    ).toString('utf8');
    const parsed = JSON.parse(raw) as AgentMetadata;
    return {
      name: typeof parsed.name === 'string' ? parsed.name : undefined,
      description: typeof parsed.description === 'string' ? parsed.description : undefined,
    };
  } catch {
    return {};
  }
}

function normalizeJson(value: unknown): Record<string, unknown> {
  return JSON.parse(
    JSON.stringify(value, (_key, nested) => {
      if (typeof nested === 'bigint') return nested.toString();
      if (typeof nested === 'undefined') return null;
      return nested;
    }),
  ) as Record<string, unknown>;
}
