import React from 'react';

import { cn } from '../index.ts';

/** Example: <Skeleton className="h-8 w-40" /> */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-gradient-to-r from-[var(--color-bg-1)] via-[var(--color-bg-2)] to-[var(--color-bg-1)]', className)} {...props} />;
}
