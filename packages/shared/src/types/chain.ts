export const ChainKind = {
  EVM: 'evm',
  SVM: 'svm',
} as const;

export type ChainKind = (typeof ChainKind)[keyof typeof ChainKind];

export const ChainEnvironment = {
  Mainnet: 'mainnet',
  Testnet: 'testnet',
  Mock: 'mock',
} as const;

export type ChainEnvironment = (typeof ChainEnvironment)[keyof typeof ChainEnvironment];

export interface ChainConfig {
  id: number | string;
  name: string;
  displayName: string;
  kind: ChainKind;
  environment: ChainEnvironment;
  rpcUrl: string;
  nativeUsdcAddress: `0x${string}` | string;
  explorerUrl: string;
  agentRegistryAddress: `0x${string}` | string | null;
  escrowManagerAddress: `0x${string}` | string | null;
  reputationOracleAddress: `0x${string}` | string | null;
  supports: {
    confidentialTasks: boolean;
    cctp: boolean;
    nativeUsdcGas: boolean;
    subSecondFinality: boolean;
  };
}
