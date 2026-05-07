
import { getChainOrThrow } from '@agora/chains';
import { ChainNotSupportedError, type Agent } from '@agora/shared';
import { type Account, type Address, type Hash, type Hex, type WalletClient } from 'viem';

import { agentRegistryAbi } from '../abis/index.ts';
import { builderCodeDataSuffix, shouldAttributeChain, writeAttributedContract } from '../attribution.ts';
import { getPublicClient, getWalletClient } from '../clients/index.ts';

type AgentStruct = {
  deployer: Address;
  tba: Address;
  pricePerCallUsdc: bigint;
  capabilityHash: Hash;
  metadataURI: string;
  createdAt: bigint | number;
  active: boolean;
};

function registryAddress(chainId: number | string): Address {
  const chain = getChainOrThrow(chainId);
  if (!chain.agentRegistryAddress) {
    throw new ChainNotSupportedError(`No AgentRegistry deployed on ${chain.displayName}`);
  }
  return chain.agentRegistryAddress as Address;
}

export async function deployAgent(
  chainId: number | string,
  account: Account | WalletClient,
  params: { metadataURI: string; capabilityHash: Hash; pricePerCallUsdc: bigint },
): Promise<{ agentId: bigint; txHash: Hash; attributed: boolean; dataSuffix?: Hex }> {
  const wallet = getWalletClient(chainId, account);
  const agentId = (await totalAgents(chainId)) + 1n;
  const txHash = await writeAttributedContract({
    chainId,
    wallet,
    account: wallet.account ?? (account as Account),
    address: registryAddress(chainId),
    abi: agentRegistryAbi,
    functionName: 'deployAgent',
    args: [params.metadataURI, params.capabilityHash, params.pricePerCallUsdc],
  });
  return { agentId, txHash, attributed: shouldAttributeChain(chainId), dataSuffix: shouldAttributeChain(chainId) ? builderCodeDataSuffix() : undefined };
}

export async function updatePrice(
  chainId: number | string,
  account: Account | WalletClient,
  agentId: bigint,
  newPrice: bigint,
): Promise<Hash> {
  const wallet = getWalletClient(chainId, account);
  return writeAttributedContract({
    chainId,
    wallet,
    account: wallet.account ?? (account as Account),
    address: registryAddress(chainId),
    abi: agentRegistryAbi,
    functionName: 'updatePrice',
    args: [agentId, newPrice],
  });
}

export async function deactivateAgent(
  chainId: number | string,
  account: Account | WalletClient,
  agentId: bigint,
): Promise<Hash> {
  const wallet = getWalletClient(chainId, account);
  return writeAttributedContract({
    chainId,
    wallet,
    account: wallet.account ?? (account as Account),
    address: registryAddress(chainId),
    abi: agentRegistryAbi,
    functionName: 'deactivateAgent',
    args: [agentId],
  });
}

export async function getAgent(chainId: number | string, agentId: bigint): Promise<Agent | null> {
  const client = getPublicClient(chainId);
  try {
    const result = (await client.readContract({
      address: registryAddress(chainId),
      abi: agentRegistryAbi,
      functionName: 'getAgent',
      args: [agentId],
    })) as unknown as AgentStruct;
    return mapAgentStruct(chainId, agentId, result);
  } catch (error) {
    if (error instanceof ChainNotSupportedError) throw error;
    return null;
  }
}

export async function totalAgents(chainId: number | string): Promise<bigint> {
  const client = getPublicClient(chainId);
  return (await client.readContract({
    address: registryAddress(chainId),
    abi: agentRegistryAbi,
    functionName: 'totalAgents',
  })) as bigint;
}

export async function tbaOf(chainId: number | string, agentId: bigint): Promise<Address> {
  const client = getPublicClient(chainId);
  return (await client.readContract({
    address: registryAddress(chainId),
    abi: agentRegistryAbi,
    functionName: 'tbaOf',
    args: [agentId],
  })) as Address;
}

export async function ownerOf(chainId: number | string, agentId: bigint): Promise<Address> {
  const client = getPublicClient(chainId);
  return (await client.readContract({
    address: registryAddress(chainId),
    abi: agentRegistryAbi,
    functionName: 'ownerOf',
    args: [agentId],
  })) as Address;
}

function mapAgentStruct(chainId: number | string, id: bigint, result: AgentStruct): Agent {
  return {
    id,
    chainId: Number(chainId),
    deployer: result.deployer,
    tbaAddress: result.tba,
    pricePerCallUsdc: result.pricePerCallUsdc,
    active: result.active,
    capabilityHash: result.capabilityHash,
    name: 'Agent',
    description: result.metadataURI,
    modelProvider: 'custom',
    createdAt: new Date(Number(result.createdAt) * 1000),
  };
}
