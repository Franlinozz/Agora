'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletClient } from 'wagmi';
import { parseUnits } from 'viem';
import { AgoraClient } from '@agora/sdk';

import { Button, toast } from '@agora/ui';

import type { DeployFormData } from './Wizard';

export function DeploySubmitButton({ data, capabilities }: { data: DeployFormData; capabilities: Array<{ id: string; name: string; description: string; inputSchema: Record<string, unknown>; outputSchema: Record<string, unknown> }> }) {
  const router = useRouter();
  const { data: walletClient } = useWalletClient();
  const [status, setStatus] = useState<'idle' | 'building' | 'pending' | 'confirmed' | 'error'>('idle');
  const [txHash, setTxHash] = useState('');

  async function deploy() {
    if (!walletClient?.account) {
      toast.error('Connect wallet before deploying.');
      return;
    }

    setStatus('building');
    try {
      const client = new AgoraClient({ defaultChainId: data.chainId, account: walletClient.account });
      setStatus('pending');
      const result = await client.deployAgent({
        name: data.name,
        description: data.description,
        capabilities,
        pricePerCallUsdc: parseUnits(data.priceUsdc || '0', 6),
        modelProvider: 'custom',
      }, data.chainId);
      setTxHash(result.txHash);
      setStatus('confirmed');
      toast.success('Agent deployed. Redirecting to profile.');
      router.push(`/agents/${result.agentId.toString()}`);
    } catch (error) {
      console.error(error);
      setStatus('error');
      toast.error('Deploy failed. Check wallet, chain, and contract addresses.');
    }
  }

  return (
    <div className="grid gap-3">
      {txHash ? <p className="font-mono text-xs text-[var(--color-success)]">Transaction: {txHash}</p> : null}
      {status === 'error' ? <p className="text-sm text-[var(--color-danger)]">Deployment could not be submitted. This is expected if contracts or wallet testnet setup are unavailable.</p> : null}
      <Button onClick={deploy} loading={status === 'building' || status === 'pending'}>{status === 'pending' ? 'Waiting for wallet…' : status === 'confirmed' ? 'Confirmed' : 'Deploy agent'}</Button>
    </div>
  );
}
