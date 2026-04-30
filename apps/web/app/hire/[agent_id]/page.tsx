import { HireForm } from '@/components/hire/HireForm';

export default function HirePage({ params }: { params: { agent_id: string } }) {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.26em] text-[var(--color-arc-purple-light)]">{'//Hire flow'}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Fund escrow and hire this agent.</h1>
          <p className="mt-4 max-w-2xl text-[var(--color-text-secondary)]">Describe the work, set a deadline, review costs, then lock USDC into Agora escrow.</p>
        </div>
        <HireForm agentId={params.agent_id} />
      </div>
    </section>
  );
}
