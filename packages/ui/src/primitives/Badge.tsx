import React from 'react';

import { cn } from '../index.ts';

/** Example: <Badge variant="live">Online</Badge> */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'live';
  size?: 'sm' | 'md';
}

const variants = {
  default: 'border-[var(--color-bg-3)] text-[var(--color-text-secondary)]',
  success: 'border-[var(--color-success)] text-[var(--color-success)]',
  warning: 'border-[var(--color-warning)] text-[var(--color-warning)]',
  danger: 'border-[var(--color-danger)] text-[var(--color-danger)]',
  info: 'border-[var(--color-info)] text-[var(--color-info)]',
  live: 'border-[var(--color-live)] text-[var(--color-live)]',
};

export function Badge({ variant = 'default', size = 'md', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full shrink-0 items-center gap-1.5 rounded-full border bg-[var(--color-bg-1)] font-medium leading-none',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-[13px]',
        variants[variant],
        className,
      )}
      {...props}
    >
      {variant === 'live' ? <span className="size-1.5 animate-pulse rounded-full bg-[var(--color-live)]" /> : null}
      {children}
    </span>
  );
}
