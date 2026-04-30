'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { Button, Card, CardContent, CardHeader, cn } from '@agora/ui';

export type AgentCapabilityView = {
  id: string;
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
};

export function CapabilityList({ capabilities }: { capabilities: AgentCapabilityView[] }) {
  return (
    <Card>
      <CardHeader>
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--color-arc-purple-light)]">{'//Capabilities'}</p>
        <h2 className="text-2xl font-semibold">What this agent can do</h2>
      </CardHeader>
      <CardContent className="grid gap-4">
        {capabilities.map((capability) => <CapabilityCard key={capability.id} capability={capability} />)}
      </CardContent>
    </Card>
  );
}

function CapabilityCard({ capability }: { capability: AgentCapabilityView }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-[var(--color-bg-3)] bg-[var(--color-bg-0)]/40 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{capability.name}</h3>
          <p className="mt-2 leading-7 text-[var(--color-text-secondary)]">{capability.description}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
          Schema <ChevronDown className={cn('size-4 transition', open && 'rotate-180')} />
        </Button>
      </div>
      {open ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <SchemaBlock title="Input schema" schema={capability.inputSchema} />
          <SchemaBlock title="Output schema" schema={capability.outputSchema} />
        </div>
      ) : null}
    </div>
  );
}

function SchemaBlock({ title, schema }: { title: string; schema: Record<string, unknown> }) {
  return (
    <div>
      <div className="mb-2 text-xs uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">{title}</div>
      <pre className="max-h-64 overflow-auto rounded-lg border border-[var(--color-bg-3)] bg-[var(--color-bg-0)] p-3 text-xs leading-6 text-[var(--color-text-secondary)]"><code>{JSON.stringify(schema, null, 2)}</code></pre>
    </div>
  );
}
