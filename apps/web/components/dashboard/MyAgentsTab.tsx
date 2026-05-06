'use client';

import Link from 'next/link';
import { Settings } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { AgentAvatar, Badge, Button, Card, CardContent, EmptyState, Input, Modal, Skeleton, UsdcAmount, toast } from '@agora/ui';

type IndexedAgent = {
  id?: string;
  pk?: number;
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
    id: agent.id ?? agent.onchainId ?? String(agent.pk ?? '0'),
    name: agent.name,
    description: agent.description,
    tbaAddress: agent.tbaAddress ?? agent.tba ?? '0x0000000000000000000000000000000000000000',
    active: agent.active ?? true,
    earningsUsdc: 0n,
    priceUsdc: BigInt(agent.pricePerCallUsdc ?? '0'),
    pendingTasks: 0,
  };
}

export function MyAgentsTab({ address }: { address: string }) {
  const { data, isLoading, error } = useQuery({ queryKey: ['dashboard-agents', address], queryFn: fetchAgents });
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
      {agents.map((agent) => <AgentManagementCard key={agent.id} agent={agent} />)}
      <span className="sr-only">Wallet {address}</span>
    </div>
  );
}

function AgentManagementCard({ agent }: { agent: MyAgent }) {
  const price = agent.priceUsdc;

  function savePrice() {
    toast.info('On-chain price updates will be enabled in a later release.');
  }

  function deactivate() {
    toast.info('On-chain deactivation will be enabled in a later release.');
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
        <Modal.Root>
          <Modal.Trigger asChild><Button variant="secondary"><Settings className="size-4" /> Manage</Button></Modal.Trigger>
          <Modal.Content>
            <Modal.Title className="text-xl font-semibold">Manage {agent.name}</Modal.Title>
            <div className="mt-5 grid gap-4">
              <Input type="text" label="Price per call" suffix="USDC" value={price.toString()} readOnly />
              <div className="flex flex-wrap gap-3">
                <Button onClick={savePrice}>Update price</Button>
                <Button variant="danger" onClick={deactivate}>Deactivate</Button>
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
