import type React from 'react';

import type { Doc } from '@/lib/docs';
import { DocsMobileNav, DocsSidebar } from './DocsSidebar';

export function DocsLayout({ docs, doc, html, children }: { docs: Doc[]; doc: Doc; html: string; children?: React.ReactNode }) {
  return (
    <section className="px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
        <div className="lg:hidden">
          <DocsMobileNav docs={docs} active={doc.slug} />
        </div>
        <div className="hidden lg:block">
          <DocsSidebar docs={docs} active={doc.slug} />
        </div>
        <article className="prose prose-invert min-w-0 max-w-none overflow-hidden rounded-xl border border-[var(--color-bg-3)] bg-[var(--color-bg-1)] p-4 sm:p-6">
          <h1 className="break-words">{doc.title}</h1>
          <div className="leading-8 text-[var(--color-text-secondary)]" dangerouslySetInnerHTML={{ __html: `<p>${html}</p>` }} />
          {children}
        </article>
      </div>
    </section>
  );
}
