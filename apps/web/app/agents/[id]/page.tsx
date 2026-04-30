import { notFound } from 'next/navigation';

import { AgentHeader, type AgentDetail } from '@/components/agent/AgentHeader';
import { CapabilityList, type AgentCapabilityView } from '@/components/agent/CapabilityList';
import { EarningsHistory, type EarningsPoint } from '@/components/agent/EarningsHistory';
import { HireCTA } from '@/components/agent/HireCTA';
import { PreviewWidget } from '@/components/agent/PreviewWidget';
import { ReputationPanel, type ReputationView } from '@/components/agent/ReputationPanel';

export const revalidate = 30;

export async function generateStaticParams() {
  return [];
}

function buildMockAgent(id: string): AgentDetail {
  const numeric = Number.parseInt(id, 10);
  const safeId = Number.isFinite(numeric) && numeric > 0 ? numeric : 1;
  return {
    id,
    chainId: safeId % 2 === 0 ? 8453 : 424242,
    name: `Agora Agent #${id}`,
    description: 'A general-purpose autonomous agent that can research, execute structured tasks, and submit verifiable deliverables through escrow.',
    deployer: '0x1111111111111111111111111111111111111111',
    tbaAddress: '0x2222222222222222222222222222222222222222',
    totalEarningsUsdc: '0',
    totalTasks: 0,
    averageRating: 0,
    pricePerCallUsdc: '1000000',
    createdAt: new Date().toISOString(),
  };
}

function buildMockCapabilities(): AgentCapabilityView[] {
  return [
    {
      id: 'research-synthesis',
      name: 'Research synthesis',
      description: 'Collects source material, compares claims, and returns a concise answer with citations and confidence notes.',
      inputSchema: { type: 'object', required: ['question'], properties: { question: { type: 'string' }, depth: { enum: ['fast', 'standard', 'deep'] } } },
      outputSchema: { type: 'object', required: ['answer'], properties: { answer: { type: 'string' }, sources: { type: 'array', items: { type: 'string' } } } },
    },
    {
      id: 'task-execution',
      name: 'Task execution',
      description: 'Runs a bounded task against acceptance criteria and returns a deliverable hash plus human-readable summary.',
      inputSchema: { type: 'object', required: ['task', 'acceptanceCriteria'], properties: { task: { type: 'string' }, acceptanceCriteria: { type: 'array', items: { type: 'string' } } } },
      outputSchema: { type: 'object', required: ['summary', 'deliverableUri'], properties: { summary: { type: 'string' }, deliverableUri: { type: 'string' } } },
    },
  ];
}

function buildMockReputation(id: string): ReputationView {
  return {
    agentId: id,
    completedTasks: 0,
    disputedTasks: 0,
    averageRating: 0,
    totalEarningsUsdc: '0',
    weightedScore: 0,
    ratingsHistogram: [0, 0, 0, 0, 0],
  };
}

function buildMockEarnings(): EarningsPoint[] {
  return [
    { date: 'Week 1', cumulativeUsdc: 0 },
    { date: 'Week 2', cumulativeUsdc: 0 },
    { date: 'Week 3', cumulativeUsdc: 0 },
    { date: 'Week 4', cumulativeUsdc: 0 },
  ];
}

export default async function AgentDetailPage({ params }: { params: { id: string } }) {
  if (!params.id || params.id.length > 80) notFound();

  const agent = buildMockAgent(params.id);
  const capabilities = buildMockCapabilities();
  const reputation = buildMockReputation(params.id);
  const earnings = buildMockEarnings();

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-6">
          <AgentHeader agent={agent} />
          <CapabilityList capabilities={capabilities} />
          <EarningsHistory points={earnings} />
        </div>
        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <ReputationPanel reputation={reputation} />
          <PreviewWidget agentId={params.id} agentName={agent.name} />
        </aside>
      </div>
      <HireCTA agentId={params.id} />
    </section>
  );
}
