'use client';

import { ChainSwitcher, ConnectWalletButton } from '@agora/ui';

export function WalletControls() {
  return (
    <div className="flex max-w-full flex-wrap items-center gap-2 overflow-hidden [&_button]:max-w-full [&_button]:truncate">
      <ChainSwitcher />
      <ConnectWalletButton />
    </div>
  );
}
