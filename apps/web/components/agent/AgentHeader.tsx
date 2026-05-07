'use client';

import Link from 'next/link';
import { Copy, ExternalLink, Share2 } from 'lucide-react';

import { AddressLink, AgentAvatar, Badge, Button, Card, CardContent, ChainBadge, UsdcAmount, toast } from '@agora/ui';

export type AgentDetail = {
  id: string;
  onchainId: string;
  chainId: number;
  chainKey: string;
  name: string;
  description: string;
  deployer: `0x${string}`;
  tbaAddress: `0x${string}`;
  totalEarningsUsdc: string;
  totalTasks: number;
  averageRating: number;
  pricePerCallUsdc: string;
  createdAt: string;
  active: boolean;
};

export function AgentHeader({ agent }: { agent: AgentDetail }) {
  async function share() {
    const url = window.location.href;
    await navigator.clipboard?.writeText(url);
    toast.success('Agent URL copied.');
  }

  async function copyTba() {
    await navigator.clipboard?.writeText(agent.tbaAddress);
    toast.success('Agent wallet copied.');
  }

  return (
    <Card variant="elevated" className="overflow-hidden">
      <div className="h-16 bg-gradient-to-r from-[var(--color-arc-purple-deep)] via-[var(--color-arc-purple)] to-[var(--color-info)] opacity-90" />
      <CardContent className="grid gap-6 p-6 md:grid-cols-[auto_1fr] md:items-start">
        <div className="rounded-3xl border border-[var(--color-bg-3)] bg-[var(--color-bg-0)] p-3">
          <AgentAvatar seed={agent.tbaAddress} size="lg" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <ChainBadge chainId={agent.chainId} />
                <Badge variant="live">Indexed profile</Badge>
                {agent.active ? null : <Badge variant="warning">Inactive</Badge>}
              </div>
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{agent.name}</h1>
              <p className="mt-4 max-w-3xl leading-7 text-[var(--color-text-secondary)]">{agent.description}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {agent.active ? (
                <Button asChild>
                  <Link href={`/hire/${agent.id}`} className="no-underline">Hire</Link>
                </Button>
              ) : (
                <Button disabled title="Inactive agents are visible for history but cannot be hired.">Unavailable</Button>
              )}
              <Button variant="secondary" onClick={share}><Share2 className="size-4" /> Share</Button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 rounded-xl border border-[var(--color-bg-3)] bg-[var(--color-bg-1)]/60 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Total earnings" value={<UsdcAmount amount={BigInt(agent.totalEarningsUsdc)} />} />
            <Metric label="Tasks completed" value={agent.totalTasks.toLocaleString()} />
            <Metric label="Average rating" value={agent.averageRating > 0 ? `${agent.averageRating.toFixed(1)} / 5` : 'New'} />
            <Metric label="Starting price" value={<UsdcAmount amount={BigInt(agent.pricePerCallUsdc)} />} />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[var(--color-text-secondary)]">
            <span>Deployer <AddressLink address={agent.deployer} chainId={agent.chainId} /></span>
            <button type="button" onClick={copyTba} className="inline-flex items-center gap-1 text-[var(--color-info)] hover:underline">
              Agent wallet <span className="font-mono">{agent.tbaAddress.slice(0, 6)}...{agent.tbaAddress.slice(-4)}</span> <Copy className="size-3.5" />
            </button>
            <Link href={`/agents/${agent.id}`} className="inline-flex items-center gap-1 text-[var(--color-info)] no-underline hover:underline">Canonical profile #{agent.onchainId} <ExternalLink className="size-3.5" /></Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}
