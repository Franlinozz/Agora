'use client';

import { MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { cn } from '@agora/ui';

export function Chatbot() {
  const pathname = usePathname();
  if (pathname.startsWith('/escrow/')) return null;

  return (
    <button
      type="button"
      aria-label="Open Agora chatbot"
      className={cn(
        'fixed bottom-5 right-5 z-40 grid size-14 place-items-center rounded-full bg-[var(--color-arc-purple)] text-white shadow-[0_0_32px_rgba(92,91,214,0.35)] transition hover:bg-[var(--color-arc-purple-light)]',
      )}
    >
      <MessageCircle className="size-6" />
    </button>
  );
}
