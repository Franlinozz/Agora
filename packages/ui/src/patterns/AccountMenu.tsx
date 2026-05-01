'use client';

import React from 'react';
import { ACTIVE_CHAINS, getChain } from '@agora/chains';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Copy, ExternalLink } from 'lucide-react';
import { useAccount, useBalance, useDisconnect } from 'wagmi';

import { Button } from '../primitives/Button.tsx';

function truncate(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function AccountMenu() {
  const { address, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const chain = chainId ? getChain(chainId) : undefined;
  const { data: balance } = useBalance({ address, chainId });
  if (!address) return null;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="secondary">{truncate(address)}</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="z-50 min-w-72 rounded-lg border border-[var(--color-bg-3)] bg-[var(--color-bg-1)] p-2 shadow-lg">
        <div className="grid gap-2 p-3 text-sm">
          <div className="font-mono text-[var(--color-text-primary)]">{truncate(address)}</div>
          <div className="text-[var(--color-text-secondary)]">Balance: {balance?.formatted ?? '—'} {balance?.symbol ?? 'USDC'}</div>
        </div>
        <DropdownMenu.Item className="cursor-pointer rounded-md px-3 py-2 text-sm outline-none hover:bg-[var(--color-bg-2)]" onSelect={() => navigator.clipboard?.writeText(address)}>
          <Copy className="mr-2 inline size-4" /> Copy address
        </DropdownMenu.Item>
        {chain ? (
          <DropdownMenu.Item className="cursor-pointer rounded-md px-3 py-2 text-sm outline-none hover:bg-[var(--color-bg-2)]" asChild>
            <a href={`${chain.explorerUrl.replace(/\/$/, '')}/address/${address}`} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 inline size-4" /> View on explorer
            </a>
          </DropdownMenu.Item>
        ) : null}
        <div className="px-3 py-2 text-xs text-[var(--color-text-tertiary)]">USDC chains: {ACTIVE_CHAINS.map((c) => c.displayName).join(', ')}</div>
        <DropdownMenu.Separator className="my-2 h-px bg-[var(--color-bg-3)]" />
        <DropdownMenu.Item className="cursor-pointer rounded-md px-3 py-2 text-sm text-[var(--color-danger)] outline-none hover:bg-[var(--color-bg-2)]" onSelect={() => disconnect()}>
          Disconnect
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
