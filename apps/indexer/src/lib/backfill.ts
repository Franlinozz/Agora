import { getChainOrThrow } from '@agora/chains';
import { eq } from 'drizzle-orm';
import type { Abi, Address, PublicClient } from 'viem';

import { db } from '../db/client.ts';
import { chains } from '../db/schema.ts';

import { logger } from './logger.ts';
import { withRpcBackoff } from './rpc-backoff.ts';

const DEFAULT_CHUNK_SIZE = 100n;

type BackfillOptions = {
  chunkSize?: bigint;
  updateProgress?: boolean;
};

type BackfillLog = unknown;

export async function backfill(
  chainId: string,
  client: PublicClient,
  address: Address,
  abi: Abi,
  onLog: (chainId: string, log: BackfillLog) => Promise<void>,
  options: BackfillOptions = {},
): Promise<void> {
  const chain = getChainOrThrow(chainId);
  const chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const currentHead = await withRpcBackoff(`${chainId}:getBlockNumber`, () =>
    client.getBlockNumber(),
  );
  const lastIndexedBlock = await ensureChainRow(chainId);
  const startBlock = lastIndexedBlock + 1n;

  if (startBlock > currentHead) {
    logger.info({ chain: chainId, address, currentHead }, 'backfill already current');
    return;
  }

  logger.info(
    { chain: chainId, address, fromBlock: startBlock, toBlock: currentHead },
    'backfill started',
  );

  for (let fromBlock = startBlock; fromBlock <= currentHead; fromBlock += chunkSize) {
    const toBlock = minBigInt(fromBlock + chunkSize - 1n, currentHead);
    const logs = await withRpcBackoff(`${chainId}:getContractEvents`, () =>
      client.getContractEvents({ address, abi, fromBlock, toBlock }),
    );

    for (const log of logs) {
      await onLog(chainId, log as BackfillLog);
    }

    if (options.updateProgress !== false) {
      await db
        .update(chains)
        .set({ lastIndexedBlock: toBlock, updatedAt: new Date() })
        .where(eq(chains.id, chainId));
    }
  }

  logger.info(
    {
      chain: chainId,
      address,
      fromBlock: startBlock,
      toBlock: currentHead,
      displayName: chain.displayName,
    },
    'backfill complete',
  );
}

export async function setLastIndexedBlock(chainId: string, blockNumber: bigint): Promise<void> {
  await ensureChainRow(chainId);
  await db
    .update(chains)
    .set({ lastIndexedBlock: blockNumber, updatedAt: new Date() })
    .where(eq(chains.id, chainId));
}

async function ensureChainRow(chainId: string): Promise<bigint> {
  const chain = getChainOrThrow(chainId);
  const existing = await db.query.chains.findFirst({ where: eq(chains.id, chainId) });

  if (existing) return existing.lastIndexedBlock;

  await db
    .insert(chains)
    .values({
      id: chainId,
      displayName: chain.displayName,
      environment: chain.environment,
      lastIndexedBlock: 0n,
    })
    .onConflictDoNothing();

  return 0n;
}

function minBigInt(left: bigint, right: bigint): bigint {
  return left < right ? left : right;
}
