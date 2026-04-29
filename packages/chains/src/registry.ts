import { ChainEnvironment, type ChainConfig } from '@agora/shared';

import { arcConfig } from './configs/arc.ts';
import { arciumConfig } from './configs/arcium.ts';
import { baseConfig } from './configs/base.ts';
import { rialoConfig } from './configs/rialo.ts';

export const ALL_CHAINS: ReadonlyArray<ChainConfig> = [
  arcConfig,
  baseConfig,
  rialoConfig,
  arciumConfig,
];

export const ACTIVE_CHAINS: ReadonlyArray<ChainConfig> = ALL_CHAINS.filter(
  (chain) => chain.environment !== ChainEnvironment.Mock,
);

export function getChain(id: number | string): ChainConfig | undefined {
  return ALL_CHAINS.find((chain) => chain.id === id);
}

export function getChainOrThrow(id: number | string): ChainConfig {
  const chain = getChain(id);
  if (!chain) {
    throw new Error(`Chain ${id} not found in registry`);
  }
  return chain;
}

export function isShim(chain: ChainConfig): boolean {
  return chain.environment === ChainEnvironment.Mock;
}
