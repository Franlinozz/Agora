import type { Agent, Reputation } from '@agora/shared';
import { Bot } from 'lucide-react';

import { AgentCard, Button, Card, CardContent, EmptyState, Skeleton } from '@agora/ui';

export type MarketplaceAgent = {
  id?: string;
  pk?: number;
  onchainId?: string;
  chainId: number | string;
  deployer: `0x${string}`;
  tbaAddress?: `0x${string}`;
  tba?: `0x${string}`;
  name: string;
  description: string;
  capabilityHash: `0x${string}`;
  pricePerCallUsdc: string;
  modelProvider?: 'openai' | 'anthropic' | 'custom';
  createdAt: string;
  active?: boolean;
  reputation?: {
    completedTasks: number;
    disputedTasks: number;
    averageRating: number;
    totalEarningsUsdc: string;
    weightedScore: number;
    lastUpdated: string;
  } | null;
};

export function getAgentDisplayId(agent: MarketplaceAgent): string {
  return agent.id ?? agent.onchainId ?? String(agent.pk ?? '0');
}

function getAgentProfileId(agent: MarketplaceAgent): string {
  return String(agent.pk ?? getAgentDisplayId(agent));
}

function normalizeAgent(agent: MarketplaceAgent): Agent {
  const id = getAgentProfileId(agent);
  const tbaAddress = agent.tbaAddress ?? agent.tba ?? '0x0000000000000000000000000000000000000000';

  return {
    id: BigInt(id),
    chainId: agent.chainId as Agent['chainId'],
    deployer: agent.deployer,
    tbaAddress,
    name: agent.name,
    description: agent.description,
    capabilityHash: agent.capabilityHash,
    pricePerCallUsdc: BigInt(agent.pricePerCallUsdc ?? '0'),
    active: agent.active ?? true,
    modelProvider: agent.modelProvider ?? 'custom',
    createdAt: new Date(agent.createdAt),
  };
}

function normalizeReputation(agent: MarketplaceAgent): Reputation | undefined {
  if (!agent.reputation) return undefined;
  return {
    ...agent.reputation,
    agentId: BigInt(getAgentProfileId(agent)),
    totalEarningsUsdc: BigInt(agent.reputation.totalEarningsUsdc),
    lastUpdated: new Date(agent.reputation.lastUpdated),
  };
}

function AgentCardSkeleton() {
  return (
    <Card>
      <CardContent className="grid gap-4 p-5">
        <div className="flex items-start gap-3">
          <Skeleton className="size-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-7 w-16 rounded-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
        <Skeleton className="h-5 w-full" />
      </CardContent>
    </Card>
  );
}

export function MarketplaceGrid({ agents, loading, onClearFilters, hasFilters }: { agents: MarketplaceAgent[]; loading: boolean; onClearFilters: () => void; hasFilters: boolean }) {
  if (loading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 9 }).map((_, index) => <AgentCardSkeleton key={index} />)}
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <EmptyState
        icon={<Bot className="size-10" />}
        title="No agents match your filters"
        description="The marketplace indexer returns an empty set for now. Clear filters or check back after agents are deployed."
        action={hasFilters ? <Button variant="secondary" onClick={onClearFilters}>Clear filters</Button> : null}
      />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {agents.map((agent) => <AgentCard key={`${agent.chainId}-${getAgentProfileId(agent)}`} agent={normalizeAgent(agent)} reputation={normalizeReputation(agent)} />)}
    </div>
  );
}
