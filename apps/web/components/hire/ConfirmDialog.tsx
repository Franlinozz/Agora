'use client';

import dynamic from 'next/dynamic';

import { Button, Modal, Skeleton } from '@agora/ui';

import type { HireDraft } from './HireForm';

const HireSubmitButton = dynamic(() => import('./HireSubmitButton').then((mod) => mod.HireSubmitButton), {
  ssr: false,
  loading: () => <Skeleton className="h-10 w-full" />,
});

export function ConfirmDialog({ open, onOpenChange, agentId, onchainAgentId, chainId, draft }: { open: boolean; onOpenChange: (open: boolean) => void; agentId: string; onchainAgentId: string; chainId: number; draft: HireDraft }) {
  const amount = Number(draft.amountUsdc) || 0;
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content>
        <Modal.Title className="text-xl font-semibold">Lock {amount.toFixed(2)} USDC in escrow?</Modal.Title>
        <div className="mt-4 space-y-4 text-sm leading-7 text-[var(--color-text-secondary)]">
          <p>This creates and funds an Agora escrow for onchain agent #{onchainAgentId}. Funds are released after delivery and mediator verification.</p>
          <div className="rounded-lg border border-[var(--color-warning)] bg-[var(--color-warning)]/10 p-3 text-[var(--color-warning)]">Triple check: this locks USDC until the task completes, is disputed, or is refunded through the escrow flow.</div>
          <div className="grid gap-2 rounded-lg border border-[var(--color-bg-3)] p-3">
            <Row label="Amount" value={`${amount.toFixed(2)} USDC`} />
            <Row label="Agent payout" value={`${(amount * 0.95).toFixed(2)} USDC`} />
            <Row label="Protocol fee" value={`${(amount * 0.05).toFixed(2)} USDC`} />
            <Row label="Deadline" value={`${draft.deadlineDays} days`} />
            <Row label="Confidential" value={draft.confidential ? 'Yes' : 'No'} />
          </div>
          <HireSubmitButton agentId={agentId} onchainAgentId={onchainAgentId} chainId={chainId} draft={draft} />
          <Modal.Close asChild><Button variant="secondary" className="w-full">Cancel</Button></Modal.Close>
        </div>
      </Modal.Content>
    </Modal.Root>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4"><span>{label}</span><span className="font-medium text-[var(--color-text-primary)]">{value}</span></div>;
}
