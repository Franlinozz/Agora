'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button, Card, CardContent, CardHeader, Input } from '@agora/ui';

const capabilities = ['Research', 'Code', 'Design', 'Data', 'Trading', 'Support'];
const chains = [
  { id: 'arc', label: 'Arc' },
  { id: 'base', label: 'Base' },
];
const reputationOptions = [
  { value: '1', label: '1+ stars' },
  { value: '3', label: '3+ stars' },
  { value: '4', label: '4+ stars' },
  { value: '4.5', label: '4.5+ stars' },
];

export function FilterSidebar({ onChange }: { onChange?: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) params.delete(key);
    else params.set(key, value);
    router.push(`/agents?${params.toString()}`);
    onChange?.();
  }, [onChange, router, searchParams]);

  const toggleListValue = useCallback((key: string, value: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    const values = new Set((params.get(key) || '').split(',').filter(Boolean));
    if (checked) values.add(value);
    else values.delete(value);
    const next = Array.from(values).join(',');
    if (next) params.set(key, next);
    else params.delete(key);
    router.push(`/agents?${params.toString()}`);
    onChange?.();
  }, [onChange, router, searchParams]);

  const selectedCapabilities = new Set((searchParams.get('capability') || '').split(',').filter(Boolean));
  const selectedChains = new Set((searchParams.get('chain') || '').split(',').filter(Boolean));

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Filters</h2>
          <Button size="sm" variant="ghost" onClick={() => router.push('/agents')}>Reset</Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-7">
        <fieldset className="grid gap-3">
          <legend className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--color-text-tertiary)]">Capability</legend>
          {capabilities.map((capability) => (
            <label key={capability} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <input type="checkbox" className="accent-[var(--color-arc-purple)]" checked={selectedCapabilities.has(capability.toLowerCase())} onChange={(event) => toggleListValue('capability', capability.toLowerCase(), event.target.checked)} />
              {capability}
            </label>
          ))}
        </fieldset>

        <fieldset className="grid gap-3">
          <legend className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--color-text-tertiary)]">Price range</legend>
          <div className="grid gap-3">
            <Input type="number" min="0" step="0.001" label="Min" suffix="USDC" value={searchParams.get('minPrice') || ''} onChange={(event) => updateParam('minPrice', event.target.value)} />
            <Input type="number" min="0" step="0.001" label="Max" suffix="USDC" value={searchParams.get('maxPrice') || ''} onChange={(event) => updateParam('maxPrice', event.target.value)} />
          </div>
        </fieldset>

        <fieldset className="grid gap-3">
          <legend className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--color-text-tertiary)]">Chain</legend>
          {chains.map((chain) => (
            <label key={chain.id} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <input type="checkbox" className="accent-[var(--color-arc-purple)]" checked={selectedChains.has(chain.id)} onChange={(event) => toggleListValue('chain', chain.id, event.target.checked)} />
              {chain.label}
            </label>
          ))}
        </fieldset>

        <fieldset className="grid gap-3">
          <legend className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--color-text-tertiary)]">Minimum reputation</legend>
          <select value={searchParams.get('minRating') || ''} onChange={(event) => updateParam('minRating', event.target.value)} className="h-10 rounded-md border border-[var(--color-bg-3)] bg-[var(--color-bg-1)] px-3 text-sm text-[var(--color-text-primary)] outline-none focus:ring-2 focus:ring-[var(--color-arc-purple)]">
            <option value="">Any rating</option>
            {reputationOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </fieldset>
      </CardContent>
    </Card>
  );
}
