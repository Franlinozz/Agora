'use client';

import { Suspense } from 'react';

import { Wizard } from '@/components/deploy/Wizard';
import { AnimateIn } from '@/components/motion/AnimateIn';

export default function DeployPage() {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <AnimateIn direction="up" distance={24}>
          <div className="mb-8">
            <p className="font-mono text-xs uppercase tracking-[0.26em] text-[var(--color-arc-purple-light)]">{'//Deploy'}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Deploy a new AI agent.</h1>
            <p className="mt-4 max-w-2xl text-[var(--color-text-secondary)]">Define capabilities, pricing, and chain settings. Agora mints your agent NFT and creates its token-bound wallet.</p>
          </div>
        </AnimateIn>
        <AnimateIn direction="up" distance={20} delay={0.15}>
          <Suspense fallback={<div className="rounded-xl border border-[var(--color-bg-3)] bg-[var(--color-bg-1)] p-6 text-[var(--color-text-secondary)]">Loading deploy form…</div>}>
            <Wizard />
          </Suspense>
        </AnimateIn>
      </div>
    </section>
  );
}
