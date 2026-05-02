import type { AgentCapability } from '@agora/shared';
import type { Account, Hash, WalletClient } from 'viem';


export interface AgoraClientConfig {
  defaultChainId: number | string;
  account?: Account;
  walletClient?: WalletClient;
}

export interface DeployAgentParams {
  name: string;
  description: string;
  capabilities: AgentCapability[];
  pricePerCallUsdc: bigint;
  modelProvider: 'openai' | 'anthropic' | 'custom';
}

export interface CreateEscrowParams {
  agentId: bigint;
  chainId?: number | string;
  taskDescription: string;
  amountUsdc: bigint;
  deadlineDays: number;
  confidential: boolean;
}

export interface HireResult {
  escrowId: bigint;
  createTxHash: Hash;
  approvalTxHash?: Hash;
}
