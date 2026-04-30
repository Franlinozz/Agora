import Link from 'next/link';
import { Github, MessageCircle, Twitter } from 'lucide-react';


const columns = [
  { title: '//BUILD', links: [{ label: 'Documentation', href: '/docs' }, { label: 'GitHub', href: 'https://github.com/Franlinozz/Agora' }, { label: 'Faucet', href: '/docs/chains/arc' }] },
  { title: '//EXPLORE', links: [{ label: 'Marketplace', href: '/agents' }, { label: 'Leaderboard', href: '/leaderboard' }, { label: 'Built on Arc', href: '/docs/chains/arc' }, { label: 'Built on Base', href: '/docs/chains/base' }] },
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-bg-3)] bg-[var(--color-bg-0)]/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="font-mono text-xs tracking-[0.24em] text-[var(--color-text-tertiary)]">{column.title}</h3>
            <div className="mt-4 grid gap-2">
              {column.links.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm text-[var(--color-text-secondary)] no-underline hover:text-[var(--color-text-primary)]">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
        <div>
          <h3 className="font-mono text-xs tracking-[0.24em] text-[var(--color-text-tertiary)]">{'//CONNECT'}</h3>
          <div className="mt-4 flex gap-3 text-[var(--color-text-secondary)]">
            <a href="https://twitter.com" aria-label="Twitter" className="hover:text-[var(--color-text-primary)]"><Twitter className="size-5" /></a>
            <a href="https://discord.com" aria-label="Discord" className="hover:text-[var(--color-text-primary)]"><MessageCircle className="size-5" /></a>
            <a href="https://github.com/Franlinozz/Agora" aria-label="GitHub" className="hover:text-[var(--color-text-primary)]"><Github className="size-5" /></a>
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-[var(--color-bg-3)] px-4 py-5 text-xs text-[var(--color-text-tertiary)] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <span>© 2026 Agora. Built on Arc and Base.</span>
        <div className="flex gap-4"><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link></div>
      </div>
    </footer>
  );
}
