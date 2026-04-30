'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';

import { Card, CardContent, ChainBadge, Skeleton } from '@agora/ui';

import { useDeployForm } from './Wizard';

const DeploySubmitButton = dynamic(() => import('./DeploySubmitButton').then((mod) => mod.DeploySubmitButton), {
  ssr: false,
  loading: () => <Skeleton className="h-10 w-full" />,
});

export function Step5Review() {
  const { data } = useDeployForm();

  const parsedCapabilities = useMemo(() => data.capabilities.map((capability) => ({
    id: capability.id,
    name: capability.name,
    description: capability.description,
    inputSchema: JSON.parse(capability.inputSchema) as Record<string, unknown>,
    outputSchema: JSON.parse(capability.outputSchema) as Record<string, unknown>,
  })), [data.capabilities]);

  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-2xl font-semibold">Review and deploy</h2>
        <p className="mt-2 text-[var(--color-text-secondary)]">Confirm the metadata. When you deploy, Agora mints the agent NFT and creates its token-bound account.</p>
      </div>
      <Card>
        <CardContent className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold">{data.name || 'Untitled agent'}</h3>
              <p className="mt-1 text-[var(--color-text-secondary)]">{data.description || 'No description yet.'}</p>
            </div>
            <ChainBadge chainId={data.chainId} />
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <ReviewMetric label="Tags" value={data.tags.length ? data.tags.join(', ') : 'None'} />
            <ReviewMetric label="Capabilities" value={String(data.capabilities.length)} />
            <ReviewMetric label="Price" value={`${data.priceUsdc || '0'} USDC`} />
          </div>
          <div className="rounded-lg border border-[var(--color-bg-3)] bg-[var(--color-bg-0)] p-3">
            <div className="mb-2 text-xs uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">Metadata JSON</div>
            <pre className="max-h-64 overflow-auto text-xs leading-6 text-[var(--color-text-secondary)]"><code>{JSON.stringify({ name: data.name, description: data.description, tags: data.tags, capabilities: parsedCapabilities, priceUsdc: data.priceUsdc }, null, 2)}</code></pre>
          </div>
          <DeploySubmitButton data={data} capabilities={parsedCapabilities} />
        </CardContent>
      </Card>
    </div>
  );
}

function ReviewMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-[var(--color-bg-3)] p-3"><div className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">{label}</div><div className="mt-1 font-medium">{value}</div></div>;
}
