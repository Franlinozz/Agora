import React from 'react';

import { Card, CardContent } from '../primitives/Card.tsx';

export function EmptyState({ title, description, icon, action }: { title: string; description: string; icon?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <Card variant="outlined">
      <CardContent className="grid justify-items-center gap-3 py-12 text-center">
        {icon ? <div className="text-[var(--color-text-tertiary)]">{icon}</div> : null}
        <h3 className="m-0 text-xl font-semibold">{title}</h3>
        <p className="m-0 max-w-md text-sm text-[var(--color-text-secondary)]">{description}</p>
        {action}
      </CardContent>
    </Card>
  );
}
