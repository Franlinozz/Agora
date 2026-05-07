'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Settings } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useChainId, useWalletClient } from 'wagmi';
import { AgoraClient, getChainOrThrow, getPublicClient } from '@agora/sdk';

import { AgentAvatar, Badge, Button, Card, CardContent, EmptyState, Input, Modal, Skeleton, UsdcAmount, toast } from '@agora/ui';

type IndexedAgent = {
  id?: string;
  pk?: number;
  chainId: string;
  onchainId?: string;
  deployer: string;
  tbaAddress?: `0x${string}`;
  tba?: `0x${string}`;
  name: string;
  description: string;
  active?: boolean;
  pricePerCallUsdc: string;
};

type AgentsResponse = {
  agents: IndexedAgent[];
};

type MyAgent = {
  id: string;
  chainId: number;
  onchainId: string;
  name: string;
  description: string;
  tbaAddress: `0x${string}`;
  active: boolean;
  earningsUsdc: bigint;
  priceUsdc: bigint;
  pendingTasks: number;
};

async function fetchAgents(): Promise<AgentsResponse> {
  const response = await fetch('/api/agents?limit=100');
  if (!response.ok) throw new Error('Could not load agents');
  return response.json() as Promise<AgentsResponse>;
}

function normalizeAgent(agent: IndexedAgent): MyAgent {
  return {
    id: String(agent.pk ?? agent.id ?? agent.onchainId ?? '0'),
    chainId: resolveChainNumber(agent.chainId),
    onchainId: String(agent.onchainId ?? agent.id ?? '0'),
    name: agent.name,
    description: agent.description,
    tbaAddress: agent.tbaAddress ?? agent.tba ?? '0x0000000000000000000000000000000000000000',
    active: agent.active ?? true,
    earningsUsdc: 0n,
    priceUsdc: BigInt(agent.pricePerCallUsdc ?? '0'),
    pendingTasks: 0,
  };
}

function resolveChainNumber(chainId: string): number {
  const parsed = Number(chainId);
  if (Number.isFinite(parsed)) return parsed;
  return Number(getChainOrThrow(chainId).id);
}

export function MyAgentsTab({ address }: { address: string }) {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['dashboard-agents', address], queryFn: fetchAgents });
  const agents = (data?.agents ?? [])
    .filter((agent) => agent.deployer.toLowerCase() === address.toLowerCase())
    .map(normalizeAgent);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => <Skeleton key={index} className="h-56 w-full" />)}
      </div>
    );
  }

  if (error) {
    return <EmptyState title="Could not load your agents" description="The dashboard could not reach the indexer API. Try again once the gateway is available." />;
  }

  if (agents.length === 0) {
    return <EmptyState title="No agents deployed yet" description="Deploy your first agent and it will appear here with earnings, pending work, and management actions." action={<Button asChild><Link href="/deploy" className="no-underline">Deploy an agent</Link></Button>} />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {agents.map((agent) => <AgentManagementCard key={agent.id} agent={agent} onDeactivated={() => void refetch()} />)}
      <span className="sr-only">Wallet {address}</span>
    </div>
  );
}

function AgentManagementCard({ agent, onDeactivated }: { agent: MyAgent; onDeactivated: () => void }) {
  const price = agent.priceUsdc;
  const connectedChainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const [deactivating, setDeactivating] = useState(false);

  function savePrice() {
    toast.info('On-chain price updates will be enabled in a later release.');
  }

  async function deactivate() {
    if (!walletClient?.account) {
      toast.error('Connect the owner wallet before deactivating.');
      return;
    }

    setDeactivating(true);
    try {
      const chain = getChainOrThrow(agent.chainId);
      if (connectedChainId !== agent.chainId) {
        throw new Error(`Switch your wallet to ${chain.displayName} before deactivating.`);
      }

      const client = new AgoraClient({ defaultChainId: agent.chainId, account: walletClient.account, walletClient });
      const txHash = await client.deactivateAgent(BigInt(agent.onchainId), agent.chainId);
      const publicClient = getPublicClient(agent.chainId);
      await publicClient.waitForTransactionReceipt({ hash: txHash });

      const response = await fetch(`/api/agents/${agent.id}/deactivate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? 'Deactivated on-chain, but the indexer sync failed.');
      }

      toast.success('Agent deactivated and removed from active listings.');
      onDeactivated();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Could not deactivate agent.');
    } finally {
      setDeactivating(false);
    }
  }

  return (
    <Card>
      <CardContent className="grid gap-4">
        <div className="flex items-start gap-3">
          <AgentAvatar seed={agent.tbaAddress} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-lg font-semibold">{agent.name}</div>
            <p className="truncate text-sm text-[var(--color-text-secondary)]">{agent.description}</p>
          </div>
          <Badge variant={agent.active ? 'live' : 'default'}>{agent.active ? 'Active' : 'Inactive'}</Badge>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <Metric label="Earnings" value={<UsdcAmount amount={agent.earningsUsdc} />} />
          <Metric label="Price" value={<UsdcAmount amount={agent.priceUsdc} />} />
          <Metric label="Pending" value={String(agent.pendingTasks)} />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="secondary"><Link href={`/agents/${agent.id}`} className="no-underline">View profile</Link></Button>
        </div>
        <Modal.Root>
          <Modal.Trigger asChild><Button variant="secondary"><Settings className="size-4" /> Manage</Button></Modal.Trigger>
          <Modal.Content>
            <Modal.Title className="text-xl font-semibold">Manage {agent.name}</Modal.Title>
            <div className="mt-5 grid gap-4">
              <Input type="text" label="Price per call" suffix="USDC" value={price.toString()} readOnly />
              <div className="flex flex-wrap gap-3">
                <Button onClick={savePrice}>Update price</Button>
                <Button variant="danger" onClick={deactivate} loading={deactivating}>{deactivating ? 'Deactivating…' : 'Deactivate'}</Button>
                <Modal.Close asChild><Button variant="secondary">Close</Button></Modal.Close>
              </div>
            </div>
          </Modal.Content>
        </Modal.Root>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="rounded-lg border border-[var(--color-bg-3)] p-3"><div className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">{label}</div><div className="mt-1 font-semibold">{value}</div></div>;
}
