'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useChainId, useWalletClient } from 'wagmi';
import { createWalletClient, custom, parseUnits, type Address, type WalletClient } from 'viem';
import { AgoraClient, getChainOrThrow, toViemChain } from '@agora/sdk';

import { Button, toast } from '@agora/ui';

import type { DeployFormData } from './Wizard';

export function DeploySubmitButton({ data, capabilities }: { data: DeployFormData; capabilities: Array<{ id: string; name: string; description: string; inputSchema: Record<string, unknown>; outputSchema: Record<string, unknown> }> }) {
  const router = useRouter();
  const connectedChainId = useChainId();
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [status, setStatus] = useState<'idle' | 'building' | 'pending' | 'confirmed' | 'error'>('idle');
  const [txHash, setTxHash] = useState('');
  const [attributionNote, setAttributionNote] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function deploy() {
    setErrorMessage('');
    setStatus('building');
    try {
      const chain = getChainOrThrow(data.chainId);
      const signer = await resolveWalletClient({ walletClient, address, isConnected, chain });
      if (connectedChainId !== data.chainId) {
        throw new Error(`Switch your wallet to ${chain.displayName} before deploying.`);
      }
      if (!chain.agentRegistryAddress) {
        throw new Error(`${chain.displayName} deployments are not live yet because NEXT_PUBLIC_${chain.displayName.toUpperCase()}_AGENT_REGISTRY is not configured in Vercel.`);
      }

      const client = new AgoraClient({ defaultChainId: data.chainId, walletClient: signer });
      setStatus('pending');
      const result = await client.deployAgent({
        name: data.name,
        description: data.description,
        capabilities,
        pricePerCallUsdc: parseUnits(data.priceUsdc || '0', 6),
        modelProvider: 'custom',
      }, data.chainId);
      setTxHash(result.txHash);
      setAttributionNote(result.attributed ? 'Base Builder Code attribution attached. Verify the transaction input ends with the ERC-8021 marker: 80218021802180218021802180218021.' : 'Attribution is only attached on Base mainnet transactions.');
      setStatus('confirmed');
      toast.success(result.attributed ? 'Agent deployed with Base attribution. Redirecting to profile.' : 'Agent deployed. Redirecting to profile.');
      router.push(`/agents/${data.chainId}:${result.agentId.toString()}`);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Deploy failed. Check wallet, chain, and contract addresses.';
      setStatus('error');
      setErrorMessage(message);
      toast.error(message);
    }
  }

  return (
    <div className="grid gap-3">
      {txHash ? <p className="font-mono text-xs text-[var(--color-success)]">Transaction: {txHash}</p> : null}
      {attributionNote ? <p className="text-xs text-[var(--color-text-secondary)]">{attributionNote}</p> : null}
      {status === 'error' ? <p className="text-sm text-[var(--color-danger)]">{errorMessage || 'Deployment could not be submitted. This is expected if contracts or wallet testnet setup are unavailable.'}</p> : null}
      <Button onClick={deploy} loading={status === 'building' || status === 'pending'}>{status === 'pending' ? 'Waiting for wallet…' : status === 'confirmed' ? 'Confirmed' : 'Deploy agent'}</Button>
    </div>
  );
}

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

async function resolveWalletClient({
  walletClient,
  address,
  isConnected,
  chain,
}: {
  walletClient?: WalletClient | null;
  address?: Address;
  isConnected: boolean;
  chain: ReturnType<typeof getChainOrThrow>;
}): Promise<WalletClient> {
  if (walletClient?.account) return walletClient;

  const provider = typeof window !== 'undefined' ? window.ethereum : undefined;
  if (!provider || !isConnected || !address) {
    throw new Error('Connect wallet before deploying. Open Agora inside Base App, then use Base App / Coinbase Wallet or Injected from the wallet popup.');
  }

  await provider.request({ method: 'eth_requestAccounts' });
  return createWalletClient({
    account: address,
    chain: toViemChain(chain),
    transport: custom(provider),
  });
}
