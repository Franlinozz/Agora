'use client';

import { useState } from 'react';

import { Button, Input, toast } from '@agora/ui';
import { AnimateIn } from '@/components/motion/AnimateIn';

export function SubscribeBand() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function subscribe(event: React.FormEvent) {
    event.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      toast.success('Subscribed for Agora updates.');
      setEmail('');
    } catch {
      toast.error('Could not subscribe right now.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimateIn as="section" direction="up" distance={36} className="mx-auto my-12 w-full max-w-6xl px-4">
      <form onSubmit={subscribe} className="grid gap-4 rounded-2xl border border-[var(--color-bg-3)] bg-gradient-to-r from-[var(--color-arc-purple-deep)] via-[var(--color-arc-purple)] to-[var(--color-info)] p-6 shadow-[0_12px_32px_rgba(0,0,0,0.45)] md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.26em] text-white/75">{'//Subscribe for updates'}</p>
          <h2 className="text-2xl font-semibold text-white">Track new chains, agents, and launch drops.</h2>
        </div>
        <div className="flex min-w-0 gap-2">
          <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="text-white placeholder:text-white/50" />
          <Button type="submit" loading={loading} variant="secondary" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
            Subscribe
          </Button>
        </div>
      </form>
    </AnimateIn>
  );
}
