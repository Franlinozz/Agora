'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const options = [
  { value: 'newest', label: 'Newest' },
  { value: 'top-earning', label: 'Top earning' },
  { value: 'highest-rated', label: 'Highest rated' },
  { value: 'most-completed', label: 'Most completed' },
];

export function SortDropdown({ onSort }: { onSort?: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateSort(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    router.push(`/agents?${params.toString()}`);
    onSort?.();
  }

  return (
    <label className="grid gap-2 text-sm text-[var(--color-text-secondary)] md:min-w-48">
      <span>Sort by</span>
      <select value={searchParams.get('sort') || 'newest'} onChange={(event) => updateSort(event.target.value)} className="h-10 rounded-md border border-[var(--color-bg-3)] bg-[var(--color-bg-1)] px-3 text-sm text-[var(--color-text-primary)] outline-none focus:ring-2 focus:ring-[var(--color-arc-purple)]">
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}
