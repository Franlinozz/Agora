'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@agora/ui';
import { ChatDrawer } from './ChatDrawer';

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  if (pathname.startsWith('/escrow/')) return null;

  return (
    <>
      {/* Floating action button with pulse ring */}
      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            aria-label="Open Agora chatbot"
            onClick={() => setOpen(true)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className={cn(
              'fixed bottom-5 right-5 z-40 grid size-14 place-items-center rounded-full',
              'bg-gradient-to-br from-[var(--color-arc-purple)] to-[var(--color-arc-purple-deep)]',
              'text-white shadow-[0_0_32px_rgba(92,91,214,0.4)]',
              'transition-shadow hover:shadow-[0_0_48px_rgba(92,91,214,0.55)]',
            )}
          >
            {/* Animated pulse ring */}
            <span className="absolute inset-0 animate-ping rounded-full bg-[var(--color-arc-purple)] opacity-20" />
            <MessageCircle className="relative size-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Close FAB when drawer is open */}
      <AnimatePresence>
        {open && (
          <motion.button
            type="button"
            aria-label="Close Agora chatbot"
            onClick={() => setOpen(false)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className={cn(
              'fixed bottom-5 right-5 z-40 grid size-14 place-items-center rounded-full',
              'bg-[var(--color-bg-2)] border border-white/[0.08]',
              'text-[var(--color-text-secondary)] shadow-[0_8px_24px_rgba(0,0,0,0.3)]',
              'transition hover:text-[var(--color-text-primary)]',
            )}
          >
            <X className="size-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <ChatDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
