import { getChainOrThrow } from '@agora/chains';
import { agentRegistryAbi, escrowManagerAbi, reputationOracleAbi } from '@agora/sdk';
import { createPublicClient, http, type Log } from 'viem';

import { backfill, setLastIndexedBlock } from '../lib/backfill.ts';
import { assertHexAddress } from '../lib/event-decoder.ts';
import { logger } from '../lib/logger.ts';

import * as handlers from './shared.ts';

const ARC_CHAIN_ID = 'arc-testnet';

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

export async function startArcIndexer(): Promise<void> {
  const chain = getChainOrThrow(ARC_CHAIN_ID);
  const client = createPublicClient({ transport: http(chain.rpcUrl) });
  const agentRegistryAddress = assertHexAddress(chain.agentRegistryAddress ?? undefined);
  const escrowManagerAddress = assertHexAddress(chain.escrowManagerAddress ?? undefined);
  const reputationOracleAddress = assertHexAddress(chain.reputationOracleAddress ?? undefined);

  const currentHead = await client.getBlockNumber();

  await backfill(ARC_CHAIN_ID, client, agentRegistryAddress, agentRegistryAbi, handleBackfillLog, {
    updateProgress: false,
  });
  await backfill(ARC_CHAIN_ID, client, escrowManagerAddress, escrowManagerAbi, handleBackfillLog, {
    updateProgress: false,
  });
  await backfill(
    ARC_CHAIN_ID,
    client,
    reputationOracleAddress,
    reputationOracleAbi,
    handleBackfillLog,
    {
      updateProgress: false,
    },
  );
  await setLastIndexedBlock(ARC_CHAIN_ID, currentHead);

  client.watchContractEvent({
    address: agentRegistryAddress,
    abi: agentRegistryAbi,
    onLogs: (logs) => void Promise.all(logs.map((log) => handleAny(ARC_CHAIN_ID, log))),
    onError: (error) =>
      logger.error({ error, chain: ARC_CHAIN_ID }, 'AgentRegistry watcher failed'),
    pollingInterval: 2_000,
  });

  client.watchContractEvent({
    address: escrowManagerAddress,
    abi: escrowManagerAbi,
    onLogs: (logs) => void Promise.all(logs.map((log) => handleAny(ARC_CHAIN_ID, log))),
    onError: (error) =>
      logger.error({ error, chain: ARC_CHAIN_ID }, 'EscrowManager watcher failed'),
    pollingInterval: 2_000,
  });

  client.watchContractEvent({
    address: reputationOracleAddress,
    abi: reputationOracleAbi,
    onLogs: (logs) => void Promise.all(logs.map((log) => handleAny(ARC_CHAIN_ID, log))),
    onError: (error) =>
      logger.error({ error, chain: ARC_CHAIN_ID }, 'ReputationOracle watcher failed'),
    pollingInterval: 2_000,
  });

  logger.info({ chain: ARC_CHAIN_ID }, 'Indexer subscribed');
}

async function handleBackfillLog(chainId: string, log: unknown): Promise<void> {
  await handleAny(chainId, log as DecodedLog);
}

async function handleAny(chainId: string, log: DecodedLog): Promise<void> {
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
}
