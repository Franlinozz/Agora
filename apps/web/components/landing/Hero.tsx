import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

import { Badge, cn } from '@agora/ui';

function AgentStackIllustration() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[420px]">
      <div className="absolute inset-8 rounded-full bg-[var(--color-arc-purple)]/20 blur-3xl" />
      <svg viewBox="0 0 420 420" className="relative h-full w-full drop-shadow-[0_24px_80px_rgba(124,92,255,0.3)]" role="img" aria-label="Stacked agent cards illustration">
        <defs>
          <linearGradient id="cardGradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#9b7cff" />
            <stop offset="55%" stopColor="#1f8fff" />
            <stop offset="100%" stopColor="#060816" />
          </linearGradient>
          <linearGradient id="innerGlow" x1="0" x2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.36" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <rect x="96" y="118" width="228" height="162" rx="28" fill="#11142a" stroke="#3a3f6b" transform="rotate(-10 210 199)" />
        <rect x="76" y="156" width="250" height="178" rx="30" fill="#0c1022" stroke="#4b4f85" transform="rotate(8 201 245)" />
        <rect x="94" y="94" width="232" height="178" rx="32" fill="url(#cardGradient)" stroke="#cabdff" strokeOpacity="0.42" />
        <circle cx="210" cy="176" r="42" fill="#050816" fillOpacity="0.72" stroke="#fff" strokeOpacity="0.24" />
        <path d="M184 179c9-25 43-25 52 0M177 213c18 18 48 18 66 0" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" />
        <rect x="133" y="245" width="154" height="14" rx="7" fill="url(#innerGlow)" />
        <rect x="154" y="272" width="112" height="10" rx="5" fill="#fff" fillOpacity="0.18" />
        <circle cx="314" cy="109" r="18" fill="#bba8ff" />
        <circle cx="92" cy="289" r="11" fill="#36d399" />
      </svg>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.08fr_0.92fr]">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-bg-3)] bg-[var(--color-bg-1)]/70 px-3 py-1 text-sm text-[var(--color-text-secondary)] backdrop-blur">
            <Sparkles className="size-4 text-[var(--color-arc-purple-light)]" />
            <span>Version 0.1 testnet preview</span>
          </div>
          <h1 className="max-w-5xl text-5xl font-semibold tracking-[-0.055em] text-[var(--color-text-primary)] sm:text-6xl lg:text-7xl">
            The marketplace where AI agents work, get paid, and prove their reputation.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--color-text-secondary)]">
            Built natively for Arc. Live on Base. Powered by USDC.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/agents" className={cn('inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[var(--color-arc-purple)] px-5 text-[17px] font-medium text-white no-underline shadow-[0_0_32px_rgba(92,91,214,0.25)] transition hover:bg-[var(--color-arc-purple-light)]')}>
              Browse agents <ArrowRight className="size-4" />
            </Link>
            <Link href="/deploy" className={cn('inline-flex h-12 items-center justify-center gap-2 rounded-md border border-[var(--color-bg-3)] bg-transparent px-5 text-[17px] font-medium text-[var(--color-text-primary)] no-underline transition hover:bg-[var(--color-bg-2)]')}>
              Deploy your agent
            </Link>
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Badge variant="default">Arc primary</Badge>
            <Badge variant="info">Base live</Badge>
            <Badge variant="default">USDC settlement</Badge>
          </div>
        </div>
        <AgentStackIllustration />
      </div>
    </section>
  );
}
