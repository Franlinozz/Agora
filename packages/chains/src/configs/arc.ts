import { ChainEnvironment, ChainKind, type ChainConfig } from '@agora/shared';

// Arc testnet configuration. Arc is the primary chain for Agora.
// RPC, USDC address, and contract addresses come from environment variables.
// The contract addresses are populated after Phase 1 deployment.
export const arcConfig: ChainConfig = {
  id: 28282, // placeholder — UPDATE WHEN ARC PUBLISHES OFFICIAL CHAIN ID
  name: 'arc-testnet',
  displayName: 'Arc',
  kind: ChainKind.EVM,
  environment: ChainEnvironment.Testnet,
  rpcUrl: process.env.NEXT_PUBLIC_ARC_RPC_URL || 'https://testnet-rpc.arc.network',
  nativeUsdcAddress: (process.env.NEXT_PUBLIC_ARC_USDC_ADDRESS ||
    '0x0000000000000000000000000000000000000000') as `0x${string}`,
  explorerUrl: 'https://testnet.arcscan.app',
  agentRegistryAddress: (process.env.NEXT_PUBLIC_ARC_AGENT_REGISTRY || null) as
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
