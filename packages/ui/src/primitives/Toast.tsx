import React from 'react';

import { cn } from '../index.ts';

/** Example: toast.success('Saved'); mount <Toaster /> once near root. */
type ToastKind = 'success' | 'error' | 'info';
type ToastItem = { id: number; kind: ToastKind; message: string };
let items: ToastItem[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

function push(kind: ToastKind, message: string) {
  const id = Date.now() + Math.random();
  items = [...items, { id, kind, message }];
  emit();
  setTimeout(() => {
    items = items.filter((item) => item.id !== id);
    emit();
  }, 4000);
}

export const toast = {
  success: (message: string) => push('success', message),
  error: (message: string) => push('error', message),
  info: (message: string) => push('info', message),
};

export function Toaster() {
  const [snapshot, setSnapshot] = React.useState(items);
  React.useEffect(() => {
    const listener = () => setSnapshot([...items]);
    listeners.add(listener);
    return () => void listeners.delete(listener);
  }, []);
  return (
    <div className="fixed bottom-4 right-4 z-[100] grid gap-2">
      {snapshot.map((item) => (
        <div key={item.id} className={cn('min-w-64 rounded-lg border bg-[var(--color-bg-1)] px-4 py-3 text-sm shadow-lg', item.kind === 'success' && 'border-[var(--color-success)]', item.kind === 'error' && 'border-[var(--color-danger)]', item.kind === 'info' && 'border-[var(--color-info)]')}>
          {item.message}
        </div>
      ))}
    </div>
  );
}
