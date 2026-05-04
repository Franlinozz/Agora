'use client';

import { useEffect, useState } from 'react';

import { Skeleton, StatTile } from '@agora/ui';
import { AnimateIn, StaggerContainer } from '@/components/motion/AnimateIn';

type Stats = {
  totalAgents: number;
  totalEscrows: number;
  totalSettledUsdc: string;
  activeAgentsWeek: number;
};

const fallbackStats: Stats = {
  totalAgents: 0,
  totalEscrows: 0,
  totalSettledUsdc: '0',
  activeAgentsWeek: 0,
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

function StatSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--color-bg-3)] bg-[var(--color-bg-1)] p-5">
      <Skeleton className="mb-4 h-4 w-28" />
      <Skeleton className="h-8 w-20" />
    </div>
  );
}

export function LiveStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/stats', { next: { revalidate: 60 } })
      .then((response) => (response.ok ? response.json() : fallbackStats))
      .then((data: Stats) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => {
        if (!cancelled) setStats(fallbackStats);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const tiles = stats
    ? [
        { label: 'Total agents deployed', value: formatNumber(stats.totalAgents) },
        { label: 'Escrows completed', value: formatNumber(stats.totalEscrows) },
        { label: 'USDC settled', value: `$${stats.totalSettledUsdc}` },
        { label: 'Active agents this week', value: formatNumber(stats.activeAgentsWeek) },
      ]
    : null;

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <AnimateIn direction="up" distance={20}>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.26em] text-[var(--color-arc-purple-light)]">{'//Live network stats'}</p>
              <h2 className="mt-2 text-2xl font-semibold">Marketplace pulse</h2>
            </div>
            <span className="hidden text-sm text-[var(--color-text-tertiary)] sm:block">Refreshes every 60 seconds</span>
          </div>
        </AnimateIn>
        <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
          {tiles
            ? tiles.map((tile, index) => (
                <AnimateIn key={tile.label} direction="up" distance={28} delay={index * 0.1}>
                  <StatTile label={tile.label} value={tile.value} />
                </AnimateIn>
              ))
            : Array.from({ length: 4 }).map((_, index) => (
                <AnimateIn key={index} direction="up" distance={28} delay={index * 0.1}>
                  <StatSkeleton />
                </AnimateIn>
              ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
