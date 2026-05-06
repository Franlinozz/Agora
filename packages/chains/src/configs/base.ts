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
  agentRegistryAddress: (process.env.NEXT_PUBLIC_BASE_AGENT_REGISTRY || '0x0BeA9A8D83a6962410956857D0bD67d59C4D070D') as
    | `0x${string}`
    | null,
  escrowManagerAddress: (process.env.NEXT_PUBLIC_BASE_ESCROW_MANAGER || '0xEc7D6EE9d7547d101DCE4E1aA687e0FAC3E865CB') as
    | `0x${string}`
    | null,
  reputationOracleAddress: (process.env.NEXT_PUBLIC_BASE_REPUTATION_ORACLE || '0xA96863Ba5555d2E5B729964fc698A2d73459e09F') as
    | `0x${string}`
    | null,
  supports: {
    confidentialTasks: true,
    cctp: true,
    nativeUsdcGas: false,
    subSecondFinality: false,
  },
};
