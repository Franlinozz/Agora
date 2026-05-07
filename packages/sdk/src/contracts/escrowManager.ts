
import { getChainOrThrow } from '@agora/chains';
import { ChainNotSupportedError, EscrowState, type Escrow } from '@agora/shared';
import { erc20Abi, type Account, type Address, type Hash, type Hex, type WalletClient } from 'viem';

import { escrowManagerAbi } from '../abis/index.ts';
import { builderCodeDataSuffix, shouldAttributeChain, writeAttributedContract } from '../attribution.ts';
import { getPublicClient, getWalletClient } from '../clients/index.ts';

type EscrowStruct = {
  agentId: bigint;
  buyer: Address;
  amountUsdc: bigint;
  taskHash: Hash;
  deliveryHash: Hash;
  deadline: bigint | number;
  state: number;
  confidential: boolean;
  encryptedTaskBlob: Hex;
  encryptedDeliveryBlob: Hex;
};

function escrowAddress(chainId: number | string): Address {
  const chain = getChainOrThrow(chainId);
  if (!chain.escrowManagerAddress) {
    throw new ChainNotSupportedError(`No EscrowManager deployed on ${chain.displayName}`);
  }
  return chain.escrowManagerAddress as Address;
}

function usdcAddress(chainId: number | string): Address {
  const chain = getChainOrThrow(chainId);
  return chain.nativeUsdcAddress as Address;
}

export async function createEscrow(
  chainId: number | string,
  account: Account | WalletClient,
  params: {
    agentId: bigint;
    taskHash: Hash;
    amountUsdc: bigint;
    deadline: bigint;
    confidential: boolean;
    encryptedTaskBlob: Hex;
  },
): Promise<{ escrowId: bigint; approvalTxHash?: Hash; createTxHash: Hash; attributed: boolean; dataSuffix?: Hex }> {
  const client = getPublicClient(chainId);
  const wallet = getWalletClient(chainId, account);
  const spender = escrowAddress(chainId);
  let approvalTxHash: Hash | undefined;

  const allowance = (await client.readContract({
    address: usdcAddress(chainId),
    abi: erc20Abi,
    functionName: 'allowance',
    args: [(wallet.account ?? (account as Account)).address, spender],
  })) as bigint;

  if (allowance < params.amountUsdc) {
    approvalTxHash = await writeAttributedContract({
      chainId,
      wallet,
      account: wallet.account ?? (account as Account),
      address: usdcAddress(chainId),
      abi: erc20Abi,
      functionName: 'approve',
      args: [spender, params.amountUsdc],
    });
    await client.waitForTransactionReceipt({ hash: approvalTxHash });
  }

  const nextEscrowId = ((await totalEscrows(chainId)) as bigint) + 1n;
  const createTxHash = await writeAttributedContract({
    chainId,
    wallet,
    account: wallet.account ?? (account as Account),
    address: spender,
    abi: escrowManagerAbi,
    functionName: 'createEscrow',
    args: [
      params.agentId,
      params.taskHash,
      params.amountUsdc,
      params.deadline,
      params.confidential,
      params.encryptedTaskBlob,
    ],
  });

  return { escrowId: nextEscrowId, approvalTxHash, createTxHash, attributed: shouldAttributeChain(chainId), dataSuffix: shouldAttributeChain(chainId) ? builderCodeDataSuffix() : undefined };
}

export async function submitDelivery(
  chainId: number | string,
  account: Account | WalletClient,
  escrowId: bigint,
  deliveryHash: Hash,
  encryptedDeliveryBlob: Hex = '0x',
): Promise<Hash> {
  const wallet = getWalletClient(chainId, account);
  return writeAttributedContract({
    chainId,
    wallet,
    account: wallet.account ?? (account as Account),
    address: escrowAddress(chainId),
    abi: escrowManagerAbi,
    functionName: 'submitDelivery',
    args: [escrowId, deliveryHash, encryptedDeliveryBlob],
  });
}

export async function verifyAndRelease(
  chainId: number | string,
  account: Account | WalletClient,
  escrowId: bigint,
): Promise<Hash> {
  const wallet = getWalletClient(chainId, account);
  return writeAttributedContract({
    chainId,
    wallet,
    account: wallet.account ?? (account as Account),
    address: escrowAddress(chainId),
    abi: escrowManagerAbi,
    functionName: 'verifyAndRelease',
    args: [escrowId],
  });
}

export async function dispute(
  chainId: number | string,
  account: Account | WalletClient,
  escrowId: bigint,
  reason: string,
): Promise<Hash> {
  const wallet = getWalletClient(chainId, account);
  return writeAttributedContract({
    chainId,
    wallet,
    account: wallet.account ?? (account as Account),
    address: escrowAddress(chainId),
    abi: escrowManagerAbi,
    functionName: 'dispute',
    args: [escrowId, reason],
  });
}

export async function refundExpired(
  chainId: number | string,
  account: Account | WalletClient,
  escrowId: bigint,
): Promise<Hash> {
  const wallet = getWalletClient(chainId, account);
  return writeAttributedContract({
    chainId,
    wallet,
    account: wallet.account ?? (account as Account),
    address: escrowAddress(chainId),
    abi: escrowManagerAbi,
    functionName: 'refundExpired',
    args: [escrowId],
  });
}

export async function getEscrow(chainId: number | string, escrowId: bigint): Promise<Escrow | null> {
  const client = getPublicClient(chainId);
  try {
    const result = (await client.readContract({
      address: escrowAddress(chainId),
      abi: escrowManagerAbi,
      functionName: 'getEscrow',
      args: [escrowId],
    })) as unknown as EscrowStruct;
    return mapEscrowStruct(chainId, escrowId, result);
  } catch (error) {
    if (error instanceof ChainNotSupportedError) throw error;
    return null;
  }
}

export async function totalEscrows(chainId: number | string): Promise<bigint> {
  const client = getPublicClient(chainId);
  return (await client.readContract({
    address: escrowAddress(chainId),
    abi: escrowManagerAbi,
    functionName: 'totalEscrows',
  })) as bigint;
}

function mapEscrowStruct(chainId: number | string, id: bigint, result: EscrowStruct): Escrow {
  return {
    id,
    chainId: Number(chainId),
    agentId: result.agentId,
    buyer: result.buyer,
    amountUsdc: result.amountUsdc,
    taskHash: result.taskHash,
    deliveryHash:
      result.deliveryHash === '0x0000000000000000000000000000000000000000000000000000000000000000'
        ? null
        : result.deliveryHash,
    deadline: new Date(Number(result.deadline) * 1000),
    state: result.state as EscrowState,
    confidential: result.confidential,
    encryptedTaskBlob: result.encryptedTaskBlob === '0x' ? null : result.encryptedTaskBlob,
    encryptedDeliveryBlob: result.encryptedDeliveryBlob === '0x' ? null : result.encryptedDeliveryBlob,
    createdAt: new Date(0),
  };
}
