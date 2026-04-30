'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Input } from '@agora/ui';

export function SearchBar({ onSearch }: { onSearch?: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get('q') || '');

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = value.trim();
      if (trimmed) params.set('q', trimmed);
      else params.delete('q');
      router.push(`/agents?${params.toString()}`);
      onSearch?.();
    }, 300);

    return () => window.clearTimeout(handle);
  }, [onSearch, router, searchParams, value]);

  return <Input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Search by name or description" prefix={<Search className="size-4" />} aria-label="Search agents" />;
}
