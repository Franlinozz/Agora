'use client';

import React from 'react';
import { ACTIVE_CHAINS, ALL_CHAINS } from '@agora/chains';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useChainId, useSwitchChain } from 'wagmi';

import { Button } from '../primitives/Button.tsx';

export function ChainSwitcher() {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const active = ALL_CHAINS.find((chain) => chain.id === chainId);
  const shims = ALL_CHAINS.filter((chain) => chain.environment === 'mock');

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="secondary">{active?.displayName ?? 'Select chain'}</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="z-50 min-w-48 rounded-lg border border-[var(--color-bg-3)] bg-[var(--color-bg-1)] p-2 shadow-lg">
        {ACTIVE_CHAINS.map((chain) => (
          <DropdownMenu.Item key={String(chain.id)} className="cursor-pointer rounded-md px-3 py-2 text-sm outline-none hover:bg-[var(--color-bg-2)]" onSelect={() => switchChain({ chainId: Number(chain.id) })}>
            {chain.displayName}
          </DropdownMenu.Item>
        ))}
        <DropdownMenu.Separator className="my-2 h-px bg-[var(--color-bg-3)]" />
        <div className="px-3 py-1 text-[11px] uppercase tracking-wide text-[var(--color-text-tertiary)]">Coming soon</div>
        {shims.map((chain) => (
          <DropdownMenu.Item key={String(chain.id)} disabled className="rounded-md px-3 py-2 text-sm text-[var(--color-text-muted)]">
            {chain.displayName}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
