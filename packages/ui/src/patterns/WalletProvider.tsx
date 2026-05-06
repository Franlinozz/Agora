'use client';

import { ACTIVE_CHAINS } from '@agora/chains';
import { connectorsForWallets, darkTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  okxWallet,
  phantomWallet,
  rabbyWallet,
  walletConnectWallet,
  zerionWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Attribution } from 'ox/erc8021';
import React from 'react';
import { createConfig, http, WagmiProvider } from 'wagmi';

const queryClient = new QueryClient();
const baseBuilderCode = process.env.NEXT_PUBLIC_BASE_BUILDER_CODE;
const dataSuffix = baseBuilderCode ? Attribution.toDataSuffix({ codes: [baseBuilderCode] }) : undefined;

export function WalletProvider({ children, walletConnectProjectId }: { children: React.ReactNode; walletConnectProjectId: string }) {
  const evmChains = ACTIVE_CHAINS.filter((chain) => chain.kind === 'evm' && typeof chain.id === 'number').map((chain) => ({
    id: Number(chain.id),
    name: chain.displayName,
    nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 6 },
    rpcUrls: { default: { http: [chain.rpcUrl] } },
    blockExplorers: { default: { name: chain.displayName, url: chain.explorerUrl } },
  }));

  const connectors = connectorsForWallets(
    [
      {
        groupName: 'Recommended',
        wallets: [metaMaskWallet, rabbyWallet, okxWallet, zerionWallet, phantomWallet, walletConnectWallet],
      },
    ],
    { appName: 'Agora', projectId: walletConnectProjectId },
  );

  const config = createConfig({
    chains: evmChains as never,
    connectors,
    transports: Object.fromEntries(evmChains.map((chain) => [chain.id, http(chain.rpcUrls.default.http[0])])) as never,
    ...(dataSuffix ? { dataSuffix } : {}),
  });

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({ accentColor: '#5C5BD6', accentColorForeground: 'white', borderRadius: 'medium', fontStack: 'system' })}>
          <>{children}</>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
