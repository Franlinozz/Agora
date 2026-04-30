'use client';

import { ChainSwitcher, ConnectWalletButton } from '@agora/ui';

export function WalletControls() {
  return (
    <>
      <ChainSwitcher />
      <ConnectWalletButton />
    </>
  );
}
