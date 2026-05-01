'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

import { Button, cn } from '@agora/ui';

const WalletControls = dynamic(() => import('./WalletControls').then((mod) => mod.WalletControls), { ssr: false });

const links = [
  { href: '/agents', label: 'Marketplace' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/deploy', label: 'Deploy' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/docs', label: 'Docs' },
  { href: '/about', label: 'About' },
];

export function TopNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-bg-3)]/70 bg-[var(--color-bg-0)]/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-medium tracking-tight text-[var(--color-text-primary)] no-underline">
          Agora
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-[var(--color-text-secondary)] no-underline transition hover:text-[var(--color-text-primary)]">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <WalletControls />
        </div>
        <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </nav>
      <div className={cn('grid gap-3 border-t border-[var(--color-bg-3)] px-4 py-4 md:hidden', !open && 'hidden')}>
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="text-sm text-[var(--color-text-secondary)] no-underline" onClick={() => setOpen(false)}>
            {link.label}
          </Link>
        ))}
        <div className="flex flex-wrap gap-2 pt-2">
          <WalletControls />
        </div>
      </div>
    </header>
  );
}
