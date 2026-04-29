import React from 'react';

import { Card, CardContent } from '../primitives/Card.tsx';

export function StatTile({ label, value, change }: { label: string; value: React.ReactNode; change?: string }) {
  const positive = change?.startsWith('+');
  return (
    <Card>
      <CardContent className="grid gap-2">
        <div className="text-sm text-[var(--color-text-secondary)]">{label}</div>
        <div className="text-2xl font-semibold">{value}</div>
        {change ? <div className={positive ? 'text-sm text-[var(--color-success)]' : 'text-sm text-[var(--color-danger)]'}>{change}</div> : null}
      </CardContent>
    </Card>
  );
}
