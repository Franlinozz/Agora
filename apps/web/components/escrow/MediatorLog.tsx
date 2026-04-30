'use client';

import { useEffect, useState } from 'react';
import { Badge, Card, CardContent, CardHeader } from '@agora/ui';

type LogLine = { id: string; timestamp: string; message: string; status?: 'pass' | 'fail' | 'info' };

export function MediatorLog({ escrowId }: { escrowId: string }) {
  const [lines, setLines] = useState<LogLine[]>([]);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const source = new EventSource(`/api/escrows/${escrowId}/log`);
    source.onopen = () => setLive(true);
    source.onerror = () => setLive(false);
    source.onmessage = (event) => {
      try { setLines((current) => [JSON.parse(event.data) as LogLine, ...current].slice(0, 30)); } catch {}
    };
    return () => source.close();
  }, [escrowId]);

  return (
    <Card>
      <CardHeader><div className="flex items-center justify-between gap-3"><div><p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--color-arc-purple-light)]">{'//Mediator'}</p><h2 className="mt-1 text-xl font-semibold">Verification log</h2></div><Badge variant={live ? 'live' : 'default'}>{live ? 'Live' : 'Idle'}</Badge></div></CardHeader>
      <CardContent className="space-y-3">
        {lines.length === 0 ? <p className="text-sm text-[var(--color-text-secondary)]">Waiting for mediator reasoning and verification events.</p> : null}
        {lines.map((line) => <div key={line.id} className="rounded-lg border border-[var(--color-bg-3)] bg-[var(--color-bg-0)]/40 p-3"><div className="mb-1 text-xs text-[var(--color-text-tertiary)]">{new Date(line.timestamp).toLocaleString()}</div><p className="text-sm leading-6 text-[var(--color-text-secondary)]">{line.message}</p></div>)}
      </CardContent>
    </Card>
  );
}
