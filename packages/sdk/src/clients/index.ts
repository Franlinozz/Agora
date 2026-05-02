
import { getChainOrThrow } from '@agora/chains';
import { ChainKind, type ChainConfig } from '@agora/shared';
import {
  createPublicClient,
  createWalletClient,
  http,
  type Account,
  type Chain,
  type PublicClient,
  type WalletClient,
} from 'viem';

export function getPublicClient(chainId: number | string): PublicClient {
  const chain = getChainOrThrow(chainId);
  return createPublicClient({
    chain: toViemChain(chain),
    transport: http(chain.rpcUrl),
  });
}

export function getWalletClient(chainId: number | string, accountOrWallet: Account | WalletClient): WalletClient {
  if ('request' in accountOrWallet && typeof accountOrWallet.request === 'function') {
    return accountOrWallet as WalletClient;
  }
  const chain = getChainOrThrow(chainId);
  return createWalletClient({
    account: accountOrWallet as Account,
    chain: toViemChain(chain),
    transport: http(chain.rpcUrl),
  });
}

export function toViemChain(chain: ChainConfig): Chain {
  if (chain.kind !== ChainKind.EVM || typeof chain.id !== 'number') {
    throw new Error(`${chain.displayName} is not an EVM chain`);
  }

  return {
    id: chain.id,
    name: chain.displayName,
    nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 6 },
    rpcUrls: {
      default: { http: [chain.rpcUrl] },
      public: { http: [chain.rpcUrl] },
    },
    blockExplorers: {
      default: { name: chain.displayName, url: chain.explorerUrl },
    },
  };
}
