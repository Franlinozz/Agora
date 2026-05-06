import { getChainOrThrow } from '@agora/chains';
import { agentRegistryAbi, escrowManagerAbi, reputationOracleAbi } from '@agora/sdk';
import { and, eq, lte } from 'drizzle-orm';
import { createPublicClient, http, type Abi, type Address, type Log } from 'viem';

import { db } from '../db/client.ts';
import { chains, events } from '../db/schema.ts';
import { backfill, setLastIndexedBlock } from '../lib/backfill.ts';
import { assertHexAddress } from '../lib/event-decoder.ts';
import { logger } from '../lib/logger.ts';
import { withRpcBackoff } from '../lib/rpc-backoff.ts';

import * as handlers from './shared.ts';

const BASE_CHAIN_ID = '8453';
const BASE_CONFIRMATIONS = 5n;
const BASE_DEPLOYMENT_START_BLOCK = BigInt(process.env.BASE_INDEXER_START_BLOCK ?? '45659285');

type DecodedLog = Log & {
  eventName?: string;
  args?: unknown;
  removed?: boolean;
};

type EventHandler = (chainId: string, log: DecodedLog) => Promise<void>;

const DISPATCH: Record<string, EventHandler> = {
  AgentDeployed: handlers.handleAgentDeployed,
  AgentPriceUpdated: handlers.handleAgentPriceUpdated,
  EscrowCreated: handlers.handleEscrowCreated,
  EscrowFunded: handlers.handleEscrowFunded,
  DeliverySubmitted: handlers.handleDeliverySubmitted,
  EscrowReleased: handlers.handleEscrowReleased,
  EscrowDisputed: handlers.handleEscrowDisputed,
  EscrowRefunded: handlers.handleEscrowRefunded,
  EscrowVerified: handlers.handleEscrowVerified,
  ReputationUpdated: handlers.handleReputationUpdated,
};

export async function startBaseIndexer(): Promise<void> {
  const chain = getChainOrThrow(BASE_CHAIN_ID);
  const client = createPublicClient({ transport: http(chain.rpcUrl) });
  const agentRegistryAddress = assertHexAddress(chain.agentRegistryAddress ?? undefined);
  const escrowManagerAddress = assertHexAddress(chain.escrowManagerAddress ?? undefined);
  const reputationOracleAddress = assertHexAddress(chain.reputationOracleAddress ?? undefined);

  const currentHead = await withRpcBackoff(`${BASE_CHAIN_ID}:getBlockNumber`, () =>
    client.getBlockNumber(),
  );
  await seedBaseStartBlockIfNeeded();

  const subscriptions: Array<{ name: string; address: Address; abi: Abi }> = [];

  if (agentRegistryAddress) {
    await backfill(BASE_CHAIN_ID, client, agentRegistryAddress, agentRegistryAbi, handleBackfillLog, {
      updateProgress: false,
    });
    subscriptions.push({ name: 'AgentRegistry', address: agentRegistryAddress, abi: agentRegistryAbi });
  } else {
    logger.warn({ chain: BASE_CHAIN_ID }, 'AgentRegistry address missing; skipping indexer');
  }

  if (escrowManagerAddress) {
    await backfill(BASE_CHAIN_ID, client, escrowManagerAddress, escrowManagerAbi, handleBackfillLog, {
      updateProgress: false,
    });
    subscriptions.push({ name: 'EscrowManager', address: escrowManagerAddress, abi: escrowManagerAbi });
  } else {
    logger.warn({ chain: BASE_CHAIN_ID }, 'EscrowManager address missing; skipping indexer');
  }

  if (reputationOracleAddress) {
    await backfill(
      BASE_CHAIN_ID,
      client,
      reputationOracleAddress,
      reputationOracleAbi,
      handleBackfillLog,
      { updateProgress: false },
    );
    subscriptions.push({ name: 'ReputationOracle', address: reputationOracleAddress, abi: reputationOracleAbi });
  } else {
    logger.warn({ chain: BASE_CHAIN_ID }, 'ReputationOracle address missing; skipping indexer');
  }

  await setLastIndexedBlock(BASE_CHAIN_ID, currentHead);
  setInterval(() => void pollBaseEvents(client, subscriptions), 10_000);
  setInterval(() => void confirmFinalizedEvents(client), 5_000);

  logger.info({ chain: BASE_CHAIN_ID }, 'Indexer subscribed');
}

async function pollBaseEvents(
  client: ReturnType<typeof createPublicClient>,
  subscriptions: Array<{ name: string; address: Address; abi: Abi }>,
): Promise<void> {
  try {
    const head = await withRpcBackoff(`${BASE_CHAIN_ID}:poll:getBlockNumber`, () =>
      client.getBlockNumber(),
    );
    const existing = await db.query.chains.findFirst({ where: eq(chains.id, BASE_CHAIN_ID) });
    const lastIndexedBlock = existing?.lastIndexedBlock ?? 0n;

    if (head <= lastIndexedBlock) return;

    for (const subscription of subscriptions) {
      await backfill(
        BASE_CHAIN_ID,
        client,
        subscription.address,
        subscription.abi,
        handleBackfillLog,
        { updateProgress: false },
      );
    }

    await setLastIndexedBlock(BASE_CHAIN_ID, head);
    logger.debug({ chain: BASE_CHAIN_ID, toBlock: head }, 'Base poll complete');
  } catch (error) {
    logger.error({ error, chain: BASE_CHAIN_ID }, 'Base poll failed');
  }
}

async function seedBaseStartBlockIfNeeded(): Promise<void> {
  const existing = await db.query.chains.findFirst({ where: eq(chains.id, BASE_CHAIN_ID) });
  if (!existing || existing.lastIndexedBlock === 0n) {
    await setLastIndexedBlock(BASE_CHAIN_ID, BASE_DEPLOYMENT_START_BLOCK);
    logger.info(
      { chain: BASE_CHAIN_ID, lastIndexedBlock: BASE_DEPLOYMENT_START_BLOCK },
      'Seeded Base indexer start block',
    );
  }
}

async function confirmFinalizedEvents(
  client: ReturnType<typeof createPublicClient>,
): Promise<void> {
  const head = await withRpcBackoff(`${BASE_CHAIN_ID}:confirmations:getBlockNumber`, () =>
    client.getBlockNumber(),
  );
  if (head < BASE_CONFIRMATIONS) return;

  const finalizedBlock = head - BASE_CONFIRMATIONS;
  await db
    .update(events)
    .set({ confirmations: Number(BASE_CONFIRMATIONS), confirmed: true })
    .where(
      and(
        eq(events.chainId, BASE_CHAIN_ID),
        eq(events.confirmed, false),
        lte(events.blockNumber, finalizedBlock),
      ),
    );
}

async function handleBackfillLog(chainId: string, log: unknown): Promise<void> {
  await handleAny(chainId, log as DecodedLog);
}

async function handleAny(chainId: string, log: DecodedLog): Promise<void> {
  try {
    const eventName = log.eventName;
    if (!eventName) {
      logger.warn({ chain: chainId }, 'Skipping undecoded log');
      return;
    }

    const fn = DISPATCH[eventName];
    if (!fn) {
      logger.debug({ chain: chainId, eventName }, 'No handler registered for event');
      return;
    }

    await fn(chainId, log);
  } catch (error) {
    logger.error({ error, chain: chainId, log }, 'Fatal error processing log');
  }
}
