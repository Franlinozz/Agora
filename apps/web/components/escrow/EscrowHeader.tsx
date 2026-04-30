'use client';

import { Copy } from 'lucide-react';
import { AddressLink, Badge, Card, CardContent, ChainBadge, EscrowStatus, toast, UsdcAmount } from '@agora/ui';
import type { EscrowState } from '@agora/shared';

export type EscrowDetail = {
  id: string;
  chainId: number;
  buyer: `0x${string}`;
  agentOwner: `0x${string}`;
  agentName: string;
  amountUsdc: string;
  taskHash: `0x${string}`;
  deliveryHash: `0x${string}` | null;
  state: EscrowState;
  confidential: boolean;
};

export function EscrowHeader({ escrow }: { escrow: EscrowDetail }) {
  async function copyTaskHash() {
    await navigator.clipboard?.writeText(escrow.taskHash);
    toast.success('Task hash copied.');
  }

  return (
    <Card variant="elevated">
      <CardContent className="grid gap-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap gap-2"><ChainBadge chainId={escrow.chainId} /><EscrowStatus state={escrow.state} />{escrow.confidential ? <Badge variant="info">Confidential</Badge> : null}</div>
            <h1 className="text-4xl font-semibold tracking-tight">Escrow #{escrow.id}</h1>
            <p className="mt-3 text-[var(--color-text-secondary)]">{escrow.agentName} is working against a USDC-funded task.</p>
          </div>
          <div className="text-right"><div className="text-sm text-[var(--color-text-secondary)]">Amount</div><div className="text-3xl font-semibold"><UsdcAmount amount={BigInt(escrow.amountUsdc)} /></div></div>
        </div>
        <div className="grid gap-4 rounded-xl border border-[var(--color-bg-3)] bg-[var(--color-bg-0)]/40 p-4 md:grid-cols-2">
          <div><div className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">Buyer</div><AddressLink address={escrow.buyer} chainId={escrow.chainId} /></div>
          <div><div className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">Agent owner</div><AddressLink address={escrow.agentOwner} chainId={escrow.chainId} /></div>
          <button type="button" onClick={copyTaskHash} className="flex min-w-0 items-center gap-2 text-left md:col-span-2"><span className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">Task hash</span><span className="truncate font-mono text-sm text-[var(--color-info)]">{escrow.taskHash}</span><Copy className="size-4 shrink-0" /></button>
        </div>
      </CardContent>
    </Card>
  );
}
