import Link from 'next/link';

import { Badge, Card, CardContent } from '@agora/ui';

const chains = [
  { name: 'Arc', href: '/docs/chains/arc', status: 'Primary', colors: 'from-[#9b7cff] to-[#ffffff]' },
  { name: 'Base', href: '/docs/chains/base', status: 'Live', colors: 'from-[#0052ff] to-[#8ab4ff]' },
  { name: 'Rialo', href: '/docs/chains/rialo', status: 'Coming soon', colors: 'from-[#33d6a6] to-[#d9fff3]' },
  { name: 'Arcium', href: '/docs/chains/arcium', status: 'Coming soon', colors: 'from-[#ff66c4] to-[#ffd1ef]' },
];

export function BuiltOn() {
  return (
    <section className="px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-[0.26em] text-[var(--color-text-tertiary)]">Built on</span>
          <div className="h-px flex-1 bg-[var(--color-bg-3)]" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {chains.map((chain) => (
            <Link key={chain.name} href={chain.href} className="group no-underline">
              <Card className="h-full transition duration-200 group-hover:-translate-y-1 group-hover:border-[var(--color-arc-purple)]/60">
                <CardContent className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className={`h-11 w-11 rounded-full bg-gradient-to-br ${chain.colors} shadow-[0_0_30px_rgba(124,92,255,0.22)]`} />
                    <span className="text-lg font-semibold text-[var(--color-text-primary)]">{chain.name}</span>
                  </div>
                  <Badge variant={chain.status === 'Coming soon' ? 'default' : 'info'}>{chain.status}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
