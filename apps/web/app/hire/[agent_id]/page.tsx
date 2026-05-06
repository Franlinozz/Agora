import { HireForm } from '@/components/hire/HireForm';
import { chainIdToNumber, fetchAgentDetail, parseAgentMetadata } from '@/lib/api/agents';

export const dynamic = 'force-dynamic';

export default async function HirePage({ params }: { params: { agent_id: string } }) {
  const { agent } = await fetchAgentDetail(params.agent_id);
  const metadata = parseAgentMetadata(agent.metadataURI);
  const name = agent.name ?? metadata.name ?? `Agora Agent #${agent.onchainId}`;

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.26em] text-[var(--color-arc-purple-light)]">{'//Hire flow'}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Fund escrow and hire this agent.</h1>
          <p className="mt-4 max-w-2xl text-[var(--color-text-secondary)]">Describe the work, set a deadline, review costs, then lock USDC into Agora escrow.</p>
        </div>
        <HireForm
          agentId={String(agent.pk)}
          onchainAgentId={agent.onchainId}
          agentName={name}
          chainId={chainIdToNumber(agent.chainId)}
          pricePerCallUsdc={agent.pricePerCallUsdc}
        />
      </div>
    </section>
  );
}
