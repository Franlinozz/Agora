import { ChainEnvironment, ChainKind, type ChainConfig } from '@agora/shared';

// Arc testnet configuration. Arc is the primary chain for Agora v1.
// Contract addresses are populated after deployment via environment variables.
export const arcConfig: ChainConfig = {
  id: 5_042_002,
  name: 'arc-testnet',
  displayName: 'Arc',
  kind: ChainKind.EVM,
  environment: ChainEnvironment.Testnet,
  rpcUrl: process.env.NEXT_PUBLIC_ARC_RPC_URL || 'https://rpc.testnet.arc.network',
  nativeUsdcAddress: (process.env.NEXT_PUBLIC_ARC_USDC_ADDRESS ||
    '0x3600000000000000000000000000000000000000') as `0x${string}`,
  explorerUrl: 'https://testnet.arcscan.app',
  agentRegistryAddress: (process.env.NEXT_PUBLIC_ARC_AGENT_REGISTRY || '0x0BeA9A8D83a6962410956857D0bD67d59C4D070D') as
    | `0x${string}`
    | null,
  escrowManagerAddress: (process.env.NEXT_PUBLIC_ARC_ESCROW_MANAGER || null) as
    | `0x${string}`
    | null,
  reputationOracleAddress: (process.env.NEXT_PUBLIC_ARC_REPUTATION_ORACLE || null) as
    | `0x${string}`
    | null,
  supports: {
    confidentialTasks: true,
    cctp: true,
    nativeUsdcGas: true,
    subSecondFinality: true,
  },
};
