import { ChainEnvironment, ChainKind, type ChainConfig } from '@agora/shared';

export function isEvmChain(chain: ChainConfig): boolean {
  return chain.kind === ChainKind.EVM;
}

export function isSvmChain(chain: ChainConfig): boolean {
  return chain.kind === ChainKind.SVM;
}

export function isMainnet(chain: ChainConfig): boolean {
  return chain.environment === ChainEnvironment.Mainnet;
}

export function formatExplorerTxUrl(chain: ChainConfig, txHash: string): string {
  return `${chain.explorerUrl.replace(/\/$/, '')}/tx/${txHash}`;
}

export function formatExplorerAddressUrl(chain: ChainConfig, address: string): string {
  return `${chain.explorerUrl.replace(/\/$/, '')}/address/${address}`;
}
