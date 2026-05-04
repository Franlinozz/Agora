'use client';

import Link from 'next/link';

import { Badge, Card, CardContent } from '@agora/ui';
import { AnimateIn, StaggerContainer } from '@/components/motion/AnimateIn';

const chains = [
  { name: 'Arc', href: '/docs/chains/arc', status: 'Primary', colors: 'from-[#9b7cff] to-[#ffffff]' },
  { name: 'Base', href: '/docs/chains/base', status: 'Live', colors: 'from-[#0052ff] to-[#8ab4ff]' },
];

export function BuiltOn() {
  return (
    <section className="px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <AnimateIn direction="left" distance={20}>
          <div className="mb-5 flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-[0.26em] text-[var(--color-text-tertiary)]">Built on</span>
            <div className="h-px flex-1 bg-[var(--color-bg-3)]" />
          </div>
        </AnimateIn>
        <StaggerContainer className="grid gap-4 sm:grid-cols-2" stagger={0.15}>
          {chains.map((chain, index) => (
            <AnimateIn key={chain.name} direction="up" distance={30} delay={index * 0.15}>
              <Link href={chain.href} className="group no-underline">
                <Card className="h-full transition duration-300 group-hover:-translate-y-1 group-hover:border-[var(--color-arc-purple)]/60">
                  <CardContent className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className={`h-11 w-11 rounded-full bg-gradient-to-br ${chain.colors} shadow-[0_0_30px_rgba(124,92,255,0.22)]`} />
                      <span className="text-lg font-semibold text-[var(--color-text-primary)]">{chain.name}</span>
                    </div>
                    <Badge variant={chain.status === 'Primary' ? 'info' : 'success'}>{chain.status}</Badge>
                  </CardContent>
                </Card>
              </Link>
            </AnimateIn>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
