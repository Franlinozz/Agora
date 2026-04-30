'use client';

import { useEffect, useRef, useState } from 'react';

import { Badge, Card, CardContent, CardHeader, ChainBadge } from '@agora/ui';

type DashboardEvent = {
  id: string;
  chainId: number;
  message: string;
  timestamp: string;
};

export function EventLog({ address }: { address: string }) {
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const source = new EventSource(`/api/events?address=${address}`);
    source.onopen = () => setConnected(true);
    source.onerror = () => setConnected(false);
    source.onmessage = (message) => {
      try {
        const event = JSON.parse(message.data) as DashboardEvent;
        setEvents((current) => [event, ...current].slice(0, 20));
      } catch {
        // Ignore malformed SSE heartbeats.
      }
    };
    return () => source.close();
  }, [address]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [events.length]);

  return (
    <Card className="xl:sticky xl:top-24 xl:self-start">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div><p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--color-arc-purple-light)]">{'//Live events'}</p><h2 className="mt-1 text-xl font-semibold">Event log</h2></div>
          <Badge variant={connected ? 'live' : 'default'}>{connected ? 'Live' : 'Idle'}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={listRef} className="max-h-[520px] space-y-3 overflow-auto pr-1">
          {events.length === 0 ? <p className="text-sm text-[var(--color-text-secondary)]">Waiting for wallet activity. The VM SSE endpoint will stream the last 20 events involving this address.</p> : null}
          {events.map((event) => (
            <div key={event.id} className="rounded-lg border border-[var(--color-bg-3)] bg-[var(--color-bg-0)]/40 p-3 text-sm">
              <div className="mb-2 flex items-center justify-between gap-3"><ChainBadge chainId={event.chainId} /><span className="text-xs text-[var(--color-text-tertiary)]">{new Date(event.timestamp).toLocaleTimeString()}</span></div>
              <p className="leading-6 text-[var(--color-text-secondary)]">{event.message}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
