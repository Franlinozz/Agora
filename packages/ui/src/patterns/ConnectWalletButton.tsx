'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

import { Badge } from '../primitives/Badge.tsx';
import { Button } from '../primitives/Button.tsx';

export function ConnectWalletButton() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, mounted, openAccountModal, openChainModal, openConnectModal }) => {
        if (!mounted) return <Button disabled>Connect wallet</Button>;
        if (!account || !chain) return <Button onClick={openConnectModal}>Connect wallet</Button>;
        return (
          <Button variant="secondary" onClick={openAccountModal}>
            <Badge size="sm" variant={chain.unsupported ? 'danger' : 'live'} onClick={(event) => { event.stopPropagation(); openChainModal(); }}>
              {chain.name}
            </Badge>
            {account.displayName}
          </Button>
        );
      }}
    </ConnectButton.Custom>
  );
}
