import { ChainEnvironment, ChainKind, type ChainConfig } from '@agora/shared';

// MOCK CONFIG. Rialo is in private devnet as of build time. When public access opens, replace this file with real RPC and contract addresses.
export const rialoConfig: ChainConfig = {
  id: 'rialo-devnet',
  name: 'rialo-devnet',
  displayName: 'Rialo',
  kind: ChainKind.SVM,
  environment: ChainEnvironment.Mock,
  rpcUrl: process.env.NEXT_PUBLIC_RIALO_RPC_URL || 'mock://rialo-devnet',
  nativeUsdcAddress: 'mock-rialo-usdc',
  explorerUrl: 'https://explorer.rialo.io',
  agentRegistryAddress: null,
  escrowManagerAddress: null,
  reputationOracleAddress: null,
  supports: {
    confidentialTasks: true,
    cctp: false,
    nativeUsdcGas: true,
    subSecondFinality: true,
  },
};
