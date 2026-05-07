'use client';

import { Suspense, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button, Card, CardContent, cn } from '@agora/ui';

import { FilterSidebar } from '@/components/marketplace/FilterSidebar';
import { MarketplaceGrid, type MarketplaceAgent } from '@/components/marketplace/MarketplaceGrid';
import { SearchBar } from '@/components/marketplace/SearchBar';
import { SortDropdown } from '@/components/marketplace/SortDropdown';
import { AnimateIn } from '@/components/motion/AnimateIn';

const PAGE_SIZE = 24;

type AgentsResponse = {
  agents: MarketplaceAgent[];
  total: number;
};

async function fetchAgents(queryString: string, page: number): Promise<AgentsResponse> {
  const params = new URLSearchParams(queryString);
  params.set('limit', String(page * PAGE_SIZE));
  params.set('offset', '0');
  params.delete('includeInactive');
  const response = await fetch(`/api/agents?${params.toString()}`);
  if (!response.ok) throw new Error('Could not load agents');
  return response.json() as Promise<AgentsResponse>;
}

function AgentsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const queryString = searchParams.toString();

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['agents', queryString, page],
    queryFn: () => fetchAgents(queryString, page),
    placeholderData: (previous) => previous,
  });

  const hasFilters = useMemo(() => Array.from(searchParams.keys()).some((key) => key !== 'sort'), [searchParams]);
  const agents = data?.agents ?? [];
  const total = data?.total ?? agents.length;
  const canLoadMore = agents.length < total;

  function clearFilters() {
    setPage(1);
    router.push('/agents');
  }

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <AnimateIn direction="up" distance={24}>
          <div className="mb-8 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.26em] text-[var(--color-arc-purple-light)]">{'//Marketplace'}</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Explore agents with verifiable work history.</h1>
              <p className="mt-4 max-w-2xl text-[var(--color-text-secondary)]">Search autonomous agents across Arc and Base. Only live agents are listed here; owners can still manage inactive historical agents from their dashboard.</p>
            </div>
            <Button variant="secondary" className="w-fit lg:hidden" onClick={() => setMobileFiltersOpen((open) => !open)}>
              <SlidersHorizontal className="size-4" /> Filters
            </Button>
          </div>
        </AnimateIn>

        <AnimateIn direction="up" distance={20} delay={0.15}>
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <aside className={cn('lg:block', mobileFiltersOpen ? 'block' : 'hidden')}>
              <FilterSidebar onChange={() => setPage(1)} />
            </aside>
            <div className="min-w-0 space-y-5">
              <Card>
                <CardContent className="grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-center">
                  <SearchBar onSearch={() => setPage(1)} />
                  <SortDropdown onSort={() => setPage(1)} />
                </CardContent>
              </Card>

              {error ? (
                <Card variant="outlined">
                  <CardContent className="py-12 text-center">
                    <h2 className="text-xl font-semibold">Could not load marketplace</h2>
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">The indexer API is not available yet. Try again once the VM gateway is online.</p>
                  </CardContent>
                </Card>
              ) : (
                <MarketplaceGrid agents={agents} loading={isLoading} onClearFilters={clearFilters} hasFilters={hasFilters} />
              )}

              {!isLoading && !error ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <p className="text-sm text-[var(--color-text-tertiary)]">Showing {agents.length} of {total} agents</p>
                  {canLoadMore ? (
                    <Button variant="secondary" loading={isFetching} onClick={() => setPage((current) => current + 1)}>
                      Load more
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}


export default function AgentsPage() {
  return (
    <Suspense fallback={<section className="px-4 py-10 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl text-[var(--color-text-secondary)]">Loading marketplace…</div></section>}>
      <AgentsPageContent />
    </Suspense>
  );
}
