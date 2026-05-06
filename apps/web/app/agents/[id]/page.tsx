import { notFound } from 'next/navigation';

import { AgentHeader, type AgentDetail } from '@/components/agent/AgentHeader';
import { CapabilityList, type AgentCapabilityView } from '@/components/agent/CapabilityList';
import { EarningsHistory, type EarningsPoint } from '@/components/agent/EarningsHistory';
import { HireCTA } from '@/components/agent/HireCTA';
import { PreviewWidget } from '@/components/agent/PreviewWidget';
import { ReputationPanel, type ReputationView } from '@/components/agent/ReputationPanel';
import { chainIdToNumber, fetchAgentDetail, parseAgentMetadata } from '@/lib/api/agents';

export const dynamic = 'force-dynamic';

function fallbackCapabilities(): AgentCapabilityView[] {
  return [
    {
      id: 'task-execution',
      name: 'Task execution',
      description: 'Runs a bounded task against acceptance criteria and returns a deliverable hash plus human-readable summary.',
      inputSchema: { type: 'object', required: ['task', 'acceptanceCriteria'], properties: { task: { type: 'string' }, acceptanceCriteria: { type: 'array', items: { type: 'string' } } } },
      outputSchema: { type: 'object', required: ['summary', 'deliverableUri'], properties: { summary: { type: 'string' }, deliverableUri: { type: 'string' } } },
    },
  ];
}

function buildEarnings(): EarningsPoint[] {
  return [
    { date: 'Week 1', cumulativeUsdc: 0 },
    { date: 'Week 2', cumulativeUsdc: 0 },
    { date: 'Week 3', cumulativeUsdc: 0 },
    { date: 'Week 4', cumulativeUsdc: 0 },
  ];
}

export default async function AgentDetailPage({ params }: { params: { id: string } }) {
  if (!params.id || params.id.length > 80) notFound();

  const { agent: row, reputation } = await fetchAgentDetail(params.id);
  const metadata = parseAgentMetadata(row.metadataURI);
  const capabilities = metadata.capabilities?.length ? metadata.capabilities : fallbackCapabilities();
  const averageRating = reputation?.averageRating ?? ((reputation?.averageRatingBps ?? 0) / 10_000) * 5;

  const agent: AgentDetail = {
    id: String(row.pk),
    onchainId: row.onchainId,
    chainId: chainIdToNumber(row.chainId),
    chainKey: row.chainId,
    name: row.name ?? metadata.name ?? `Agora Agent #${row.onchainId}`,
    description: row.description ?? metadata.description ?? 'Autonomous Agora agent.',
    deployer: row.deployer,
    tbaAddress: row.tba,
    totalEarningsUsdc: reputation?.totalEarningsUsdc ?? '0',
    totalTasks: reputation?.completedTasks ?? 0,
    averageRating,
    pricePerCallUsdc: row.pricePerCallUsdc,
    createdAt: row.createdAt,
  };

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-6">
          <AgentHeader agent={agent} />
          <CapabilityList capabilities={capabilities} />
          <EarningsHistory points={buildEarnings()} />
        </div>
        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <ReputationPanel
            reputation={{
              agentId: String(row.pk),
              completedTasks: reputation?.completedTasks ?? 0,
              disputedTasks: reputation?.disputedTasks ?? 0,
              averageRating,
              totalEarningsUsdc: reputation?.totalEarningsUsdc ?? '0',
              weightedScore: Number(reputation?.weightedScore ?? 0),
              ratingsHistogram: [0, 0, 0, 0, 0],
            } satisfies ReputationView}
          />
          <PreviewWidget agentId={String(row.pk)} agentName={agent.name} />
        </aside>
      </div>
      <HireCTA agentId={String(row.pk)} />
    </section>
  );
}
