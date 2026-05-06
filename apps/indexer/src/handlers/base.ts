import { getChainOrThrow } from '@agora/chains';
import { agentRegistryAbi, escrowManagerAbi, reputationOracleAbi } from '@agora/sdk';
import { and, eq, lte } from 'drizzle-orm';
import { createPublicClient, http, type Log } from 'viem';

import { db } from '../db/client.ts';
import { events } from '../db/schema.ts';
import { backfill, setLastIndexedBlock } from '../lib/backfill.ts';
import { assertHexAddress } from '../lib/event-decoder.ts';
import { logger } from '../lib/logger.ts';
import { withRpcBackoff } from '../lib/rpc-backoff.ts';

import * as handlers from './shared.ts';

const BASE_CHAIN_ID = '8453';
const BASE_CONFIRMATIONS = 5n;

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

  if (agentRegistryAddress) {
    await backfill(BASE_CHAIN_ID, client, agentRegistryAddress, agentRegistryAbi, handleBackfillLog, {
      updateProgress: false,
    });
    client.watchContractEvent({
      address: agentRegistryAddress,
      abi: agentRegistryAbi,
      onLogs: (logs) => void Promise.all(logs.map((log) => handleAny(BASE_CHAIN_ID, log))),
      onError: (error) =>
        logger.error({ error, chain: BASE_CHAIN_ID }, 'Base AgentRegistry watcher failed'),
      poll: true,
      pollingInterval: 5_000,
    });
  } else {
    logger.warn({ chain: BASE_CHAIN_ID }, 'AgentRegistry address missing; skipping indexer');
  }

  if (escrowManagerAddress) {
    await backfill(BASE_CHAIN_ID, client, escrowManagerAddress, escrowManagerAbi, handleBackfillLog, {
      updateProgress: false,
    });
    client.watchContractEvent({
      address: escrowManagerAddress,
      abi: escrowManagerAbi,
      onLogs: (logs) => void Promise.all(logs.map((log) => handleAny(BASE_CHAIN_ID, log))),
      onError: (error) =>
        logger.error({ error, chain: BASE_CHAIN_ID }, 'Base EscrowManager watcher failed'),
      poll: true,
      pollingInterval: 5_000,
    });
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
    client.watchContractEvent({
      address: reputationOracleAddress,
      abi: reputationOracleAbi,
      onLogs: (logs) => void Promise.all(logs.map((log) => handleAny(BASE_CHAIN_ID, log))),
      onError: (error) =>
        logger.error({ error, chain: BASE_CHAIN_ID }, 'Base ReputationOracle watcher failed'),
      poll: true,
      pollingInterval: 5_000,
    });
  } else {
    logger.warn({ chain: BASE_CHAIN_ID }, 'ReputationOracle address missing; skipping indexer');
  }

  await setLastIndexedBlock(BASE_CHAIN_ID, currentHead);
  setInterval(() => void confirmFinalizedEvents(client), 5_000);

  logger.info({ chain: BASE_CHAIN_ID }, 'Indexer subscribed');
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
