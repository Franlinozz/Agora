import { ChainEnvironment, ChainKind, type ChainConfig } from '@agora/shared';

export const baseConfig: ChainConfig = {
  id: 8453,
  name: 'base-mainnet',
  displayName: 'Base',
  kind: ChainKind.EVM,
  environment: ChainEnvironment.Mainnet,
  rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org',
  nativeUsdcAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  explorerUrl: 'https://basescan.org',
  agentRegistryAddress: (process.env.NEXT_PUBLIC_BASE_AGENT_REGISTRY || null) as
    | `0x${string}`
    | null,
  escrowManagerAddress: (process.env.NEXT_PUBLIC_BASE_ESCROW_MANAGER || null) as
    | `0x${string}`
    | null,
  reputationOracleAddress: (process.env.NEXT_PUBLIC_BASE_REPUTATION_ORACLE || null) as
    | `0x${string}`
    | null,
  supports: {
    confidentialTasks: true,
    cctp: true,
    nativeUsdcGas: false,
    subSecondFinality: false,
  },
};
