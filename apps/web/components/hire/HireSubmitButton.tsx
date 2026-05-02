'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletClient } from 'wagmi';
import { parseUnits } from 'viem';
import { arcConfig } from '@agora/chains';
import { AgoraClient } from '@agora/sdk';

import { Button, toast } from '@agora/ui';

import type { HireDraft } from './HireForm';

export function HireSubmitButton({ agentId, draft }: { agentId: string; draft: HireDraft }) {
  const router = useRouter();
  const { data: walletClient } = useWalletClient();
  const [status, setStatus] = useState<'idle' | 'checking' | 'pending' | 'confirmed' | 'error'>('idle');

  async function submit() {
    if (!walletClient?.account) {
      toast.error('Connect wallet before funding escrow.');
      return;
    }

    setStatus('checking');
    try {
      const client = new AgoraClient({ defaultChainId: Number(arcConfig.id), account: walletClient.account, walletClient });
      setStatus('pending');
      const result = await client.hire({
        agentId: BigInt(agentId),
        taskDescription: draft.taskDescription,
        amountUsdc: parseUnits(draft.amountUsdc || '0', 6),
        deadlineDays: Number(draft.deadlineDays),
        confidential: draft.confidential,
      });
      setStatus('confirmed');
      toast.success('Escrow funded. Redirecting.');
      router.push(`/escrow/${result.escrowId.toString()}`);
    } catch (error) {
      console.error(error);
      setStatus('error');
      toast.error('Hire transaction failed. Check wallet, USDC balance, and chain setup.');
    }
  }

  return (
    <div className="grid gap-3">
      {status === 'error' ? <p className="text-sm text-[var(--color-danger)]">Could not submit escrow. This is expected until contracts, balances, and mediator keys are configured.</p> : null}
      <Button onClick={submit} loading={status === 'checking' || status === 'pending'}>{status === 'pending' ? 'Waiting for wallet…' : 'Confirm and fund escrow'}</Button>
    </div>
  );
}
