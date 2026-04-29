import { getChain } from '@agora/chains';
import { Copy } from 'lucide-react';
import React from 'react';


import { cn } from '../index.ts';

function short(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function AddressLink({ address, chainId, truncate = true }: { address: string; chainId: number | string; truncate?: boolean }) {
  const chain = getChain(chainId);
  const href = chain ? `${chain.explorerUrl.replace(/\/$/, '')}/address/${address}` : undefined;
  return (
    <span className="inline-flex items-center gap-1 font-mono text-sm">
      <a className={cn('text-[var(--color-info)] hover:underline', !href && 'pointer-events-none text-[var(--color-text-secondary)]')} href={href} target="_blank" rel="noreferrer">
        {truncate ? short(address) : address}
      </a>
      <button type="button" aria-label="Copy address" onClick={() => navigator.clipboard?.writeText(address)} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]">
        <Copy className="size-3.5" />
      </button>
    </span>
  );
}
