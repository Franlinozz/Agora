import Link from 'next/link';
import { cn } from '@agora/ui';

import type { Doc } from '@/lib/docs';

function groupDocs(docs: Doc[]) {
  return docs.reduce<Record<string, Doc[]>>((acc, doc) => {
    (acc[doc.category] ||= []).push(doc);
    return acc;
  }, {});
}

export function DocsSidebar({ docs, active }: { docs: Doc[]; active: string }) {
  const groups = groupDocs(docs);

  return (
    <aside className="sticky top-24 space-y-6">
      {Object.entries(groups).map(([category, items]) => (
        <div key={category}>
          <h3 className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">{category}</h3>
          <div className="grid gap-1">
            {items.map((doc) => <DocLink key={doc.slug} doc={doc} active={active === doc.slug} />)}
          </div>
        </div>
      ))}
    </aside>
  );
}

export function DocsMobileNav({ docs, active }: { docs: Doc[]; active: string }) {
  const groups = groupDocs(docs);

  return (
    <nav className="min-w-0 overflow-hidden rounded-xl border border-[var(--color-bg-3)] bg-[var(--color-bg-1)] p-3">
      <p className="px-1 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">Docs sections</p>
      <div className="mt-3 flex max-w-full gap-2 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {Object.entries(groups).flatMap(([category, items]) => [
          <span key={`${category}-label`} className="flex shrink-0 items-center px-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">
            {category}
          </span>,
          ...items.map((doc) => <DocLink key={doc.slug} doc={doc} active={active === doc.slug} compact />),
        ])}
      </div>
    </nav>
  );
}

function DocLink({ doc, active, compact = false }: { doc: Doc; active: boolean; compact?: boolean }) {
  return (
    <Link
      href={`/docs/${doc.slug}`}
      className={cn(
        'no-underline transition',
        compact ? 'shrink-0 rounded-full px-3 py-2 text-sm whitespace-nowrap' : 'rounded-md px-3 py-2 text-sm',
        active ? 'bg-[var(--color-bg-2)] text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-1)]',
      )}
    >
      {doc.title}
    </Link>
  );
}
