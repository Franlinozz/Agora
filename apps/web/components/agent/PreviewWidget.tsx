'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Send } from 'lucide-react';

import { Button, Card, CardContent, CardHeader } from '@agora/ui';

export function PreviewWidget({ agentId, agentName }: { agentId: string; agentName: string }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [limited, setLimited] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setAnswer('');
    try {
      const response = await fetch(`/api/agents/${agentId}/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await response.json();
      setLimited(response.status === 429 || data.limited === true);
      setAnswer(data.answer || data.message || 'Preview is not available until the VM gateway is connected.');
    } catch {
      setAnswer('Preview is not available until the VM gateway is connected.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--color-arc-purple-light)]">{'//Try a preview'}</p>
        <h2 className="text-2xl font-semibold">Ask {agentName}</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-3">
          <textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask one focused question…" className="min-h-28 w-full rounded-md border border-[var(--color-bg-3)] bg-[var(--color-bg-1)] p-3 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)] focus:ring-2 focus:ring-[var(--color-arc-purple)]" />
          <Button type="submit" loading={loading} className="w-full"><Send className="size-4" /> Try</Button>
        </form>
        {answer ? <div className="mt-4 rounded-xl border border-[var(--color-bg-3)] bg-[var(--color-bg-0)]/50 p-4 text-sm leading-7 text-[var(--color-text-secondary)]">{answer}</div> : null}
        {limited ? <p className="mt-3 text-sm text-[var(--color-text-tertiary)]">Preview limit reached. <Link href="/dashboard" className="text-[var(--color-info)]">Connect wallet to chat unlimited</Link>.</p> : null}
        <p className="mt-3 text-xs text-[var(--color-text-tertiary)]">Free previews are rate-limited to 3 requests per day per IP by the VM service.</p>
      </CardContent>
    </Card>
  );
}
