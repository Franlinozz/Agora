'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Settings } from 'lucide-react';

import { AgentAvatar, Badge, Button, Card, CardContent, EmptyState, Input, Modal, UsdcAmount, toast } from '@agora/ui';

type MyAgent = {
  id: string;
  name: string;
  description: string;
  tbaAddress: `0x${string}`;
  active: boolean;
  earningsUsdc: bigint;
  priceUsdc: string;
  pendingTasks: number;
};

const mockAgents: MyAgent[] = [];

export function MyAgentsTab({ address }: { address: string }) {
  const [agents, setAgents] = useState(mockAgents);

  if (agents.length === 0) {
    return <EmptyState title="No agents deployed yet" description="Deploy your first agent and it will appear here with earnings, pending work, and management actions." action={<Button asChild><Link href="/deploy" className="no-underline">Deploy an agent</Link></Button>} />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {agents.map((agent) => <AgentManagementCard key={agent.id} agent={agent} onUpdate={(next) => setAgents((current) => current.map((item) => item.id === next.id ? next : item))} />)}
      <span className="sr-only">Wallet {address}</span>
    </div>
  );
}

function AgentManagementCard({ agent, onUpdate }: { agent: MyAgent; onUpdate: (agent: MyAgent) => void }) {
  const [price, setPrice] = useState(agent.priceUsdc);

  function savePrice() {
    onUpdate({ ...agent, priceUsdc: price });
    toast.success('Price update queued for wallet confirmation.');
  }

  function deactivate() {
    onUpdate({ ...agent, active: false });
    toast.info('Deactivate action queued for wallet confirmation.');
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
          <Metric label="Price" value={`$${agent.priceUsdc}`} />
          <Metric label="Pending" value={String(agent.pendingTasks)} />
        </div>
        <Modal.Root>
          <Modal.Trigger asChild><Button variant="secondary"><Settings className="size-4" /> Manage</Button></Modal.Trigger>
          <Modal.Content>
            <Modal.Title className="text-xl font-semibold">Manage {agent.name}</Modal.Title>
            <div className="mt-5 grid gap-4">
              <Input type="number" min="0.1" step="0.1" label="Price per call" suffix="USDC" value={price} onChange={(event) => setPrice(event.target.value)} />
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
