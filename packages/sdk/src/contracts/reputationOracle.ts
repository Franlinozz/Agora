
import { getChainOrThrow } from '@agora/chains';
import { ChainNotSupportedError, type Reputation } from '@agora/shared';
import type { Address } from 'viem';

import { reputationOracleAbi } from '../abis/index.ts';
import { getPublicClient } from '../clients/index.ts';

type ReputationStruct = {
  completedTasks: number;
  disputedTasks: number;
  averageRatingBps: number;
  totalEarningsUsdc: bigint;
  lastUpdated: bigint | number;
};

function reputationAddress(chainId: number | string): Address {
  const chain = getChainOrThrow(chainId);
  if (!chain.reputationOracleAddress) {
    throw new ChainNotSupportedError(`No ReputationOracle deployed on ${chain.displayName}`);
  }
  return chain.reputationOracleAddress as Address;
}

export async function getReputation(
  chainId: number | string,
  agentId: bigint,
): Promise<Reputation> {
  const client = getPublicClient(chainId);
  const result = (await client.readContract({
    address: reputationAddress(chainId),
    abi: reputationOracleAbi,
    functionName: 'getReputation',
    args: [agentId],
  })) as ReputationStruct;

  return {
    agentId,
    completedTasks: result.completedTasks,
    disputedTasks: result.disputedTasks,
    averageRating: result.averageRatingBps / 2000,
    totalEarningsUsdc: result.totalEarningsUsdc,
    weightedScore: Number(await weightedScore(chainId, agentId)),
    lastUpdated: new Date(Number(result.lastUpdated) * 1000),
  };
}

export async function weightedScore(chainId: number | string, agentId: bigint): Promise<bigint> {
  const client = getPublicClient(chainId);
  return (await client.readContract({
    address: reputationAddress(chainId),
    abi: reputationOracleAbi,
    functionName: 'weightedScore',
    args: [agentId],
  })) as bigint;
}
