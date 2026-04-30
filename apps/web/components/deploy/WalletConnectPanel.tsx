'use client';

import { useAccount } from 'wagmi';

import { Badge, ChainSwitcher, ConnectWalletButton } from '@agora/ui';

export function WalletConnectPanel() {
  const { isConnected, address } = useAccount();
  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">Wallet</h3>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{isConnected ? `Connected: ${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Connect to deploy on-chain.'}</p>
        </div>
        <Badge variant={isConnected ? 'success' : 'warning'}>{isConnected ? 'Connected' : 'Required'}</Badge>
      </div>
      <div className="flex flex-wrap gap-3"><ConnectWalletButton /><ChainSwitcher /></div>
    </>
  );
}
