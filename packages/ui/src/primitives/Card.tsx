import React from 'react';

import { cn } from '../index.ts';

/** Example: <Card><CardHeader>Title</CardHeader><CardContent>Body</CardContent></Card> */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
}

const variants = {
  default: 'border border-[var(--color-bg-3)] bg-[var(--color-bg-1)]',
  elevated: 'border border-[var(--color-bg-3)] bg-[var(--color-bg-1)] shadow-[0_12px_32px_rgba(0,0,0,0.45)]',
  outlined: 'border border-[var(--color-bg-3)] bg-transparent',
};

export function Card({ variant = 'default', className, ...props }: CardProps) {
  return <div className={cn('rounded-xl', variants[variant], className)} {...props} />;
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('grid gap-1 border-b border-[var(--color-bg-3)] p-5', className)} {...props} />;
}
export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5', className)} {...props} />;
}
export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center gap-3 border-t border-[var(--color-bg-3)] p-5', className)} {...props} />;
}
