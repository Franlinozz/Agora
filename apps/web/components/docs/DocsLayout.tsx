import type React from 'react';

import type { Doc } from '@/lib/docs';
import { DocsMobileNav, DocsSidebar } from './DocsSidebar';

export function DocsLayout({ docs, doc, html, children }: { docs: Doc[]; doc: Doc; html: string; children?: React.ReactNode }) {
  return (
    <section className="min-w-0 overflow-x-hidden px-3 py-5 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl min-w-0 gap-4 overflow-x-hidden lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
        <div className="min-w-0 lg:hidden">
          <DocsMobileNav docs={docs} active={doc.slug} />
        </div>
        <div className="hidden lg:block">
          <DocsSidebar docs={docs} active={doc.slug} />
        </div>
        <article className="prose prose-invert min-w-0 max-w-full overflow-hidden break-words rounded-xl border border-[var(--color-bg-3)] bg-[var(--color-bg-1)] p-3 text-sm sm:p-6 sm:text-base">
          <h1 className="break-words text-3xl sm:text-5xl">{doc.title}</h1>
          <div className="min-w-0 overflow-hidden leading-7 text-[var(--color-text-secondary)] sm:leading-8" dangerouslySetInnerHTML={{ __html: `<p>${html}</p>` }} />
          {children}
        </article>
      </div>
    </section>
  );
}
