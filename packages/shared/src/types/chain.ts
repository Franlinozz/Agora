export enum ChainKind {
  EVM = 'evm',
  SVM = 'svm',
}

export enum ChainEnvironment {
  Mainnet = 'mainnet',
  Testnet = 'testnet',
  Mock = 'mock',
}

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
