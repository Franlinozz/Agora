'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChainId, useWalletClient } from 'wagmi';
import { parseUnits } from 'viem';
import { AgoraClient, getChainOrThrow } from '@agora/sdk';

import { Button, toast } from '@agora/ui';

import type { HireDraft } from './HireForm';

export function HireSubmitButton({ agentId, onchainAgentId, chainId, draft }: { agentId: string; onchainAgentId: string; chainId: number; draft: HireDraft }) {
  const router = useRouter();
  const connectedChainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const [status, setStatus] = useState<'idle' | 'checking' | 'pending' | 'confirmed' | 'error'>('idle');
  const [attributionNote, setAttributionNote] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function submit() {
    if (!walletClient?.account) {
      toast.error('Connect wallet before funding escrow.');
      return;
    }

    setErrorMessage('');
    setStatus('checking');
    try {
      const chain = getChainOrThrow(chainId);
      if (connectedChainId !== chainId) {
        throw new Error(`Switch your wallet to ${chain.displayName} before funding escrow.`);
      }
      if (!chain.escrowManagerAddress) {
        throw new Error(`${chain.displayName} escrow is not live yet.`);
      }

      const client = new AgoraClient({ defaultChainId: chainId, account: walletClient.account, walletClient });
      setStatus('pending');
      const result = await client.hire({
        agentId: BigInt(onchainAgentId),
        taskDescription: draft.taskDescription,
        amountUsdc: parseUnits(draft.amountUsdc || '0', 6),
        deadlineDays: Number(draft.deadlineDays),
        confidential: draft.confidential,
        chainId,
      });
      setAttributionNote(result.attributed ? 'Base Builder Code attribution attached to the escrow transaction. Verify input data ends with the ERC-8021 marker: 80218021802180218021802180218021.' : 'Attribution is only attached on Base mainnet transactions.');
      setStatus('confirmed');
      toast.success(result.attributed ? 'Escrow funded with Base attribution. Redirecting.' : 'Escrow funded. Redirecting.');
      router.push(`/escrow/${result.escrowId.toString()}`);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Hire transaction failed. Check wallet, USDC balance, and chain setup.';
      setStatus('error');
      setErrorMessage(message);
      toast.error(message);
    }
  }

  return (
    <div className="grid gap-3">
      {status === 'error' ? <p className="text-sm text-[var(--color-danger)]">{errorMessage || 'Could not submit escrow. Check wallet, USDC balance, and chain setup.'}</p> : null}
      {attributionNote ? <p className="text-xs text-[var(--color-text-secondary)]">{attributionNote}</p> : null}
      <Button onClick={submit} loading={status === 'checking' || status === 'pending'}>{status === 'pending' ? 'Waiting for wallet…' : 'Confirm and fund escrow'}</Button>
    </div>
  );
}
