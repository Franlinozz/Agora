import { ChainEnvironment, ChainKind, type ChainConfig } from '@agora/shared';

// MOCK CONFIG. Arcium is integrated as a privacy compute layer in v1.5. Today, confidential tasks use ECIES from @agora/shared. This config exists so the chain switcher can preview the integration.
export const arciumConfig: ChainConfig = {
  id: 'arcium',
  name: 'arcium',
  displayName: 'Arcium',
  kind: ChainKind.SVM,
  environment: ChainEnvironment.Mock,
  rpcUrl: process.env.NEXT_PUBLIC_ARCIUM_ENDPOINT || 'mock://arcium',
  nativeUsdcAddress: 'mock-arcium-usdc',
  explorerUrl: 'https://arcium.com',
  agentRegistryAddress: null,
  escrowManagerAddress: null,
  reputationOracleAddress: null,
  supports: {
    confidentialTasks: true,
    cctp: false,
    nativeUsdcGas: false,
    subSecondFinality: false,
  },
};
