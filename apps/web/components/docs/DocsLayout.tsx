import type React from 'react';

import type { Doc } from '@/lib/docs';
import { DocsSidebar } from './DocsSidebar';

export function DocsLayout({ docs, doc, html, children }: { docs: Doc[]; doc: Doc; html: string; children?: React.ReactNode }) {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[280px_1fr]">
        <DocsSidebar docs={docs} active={doc.slug} />
        <article className="prose prose-invert max-w-none rounded-xl border border-[var(--color-bg-3)] bg-[var(--color-bg-1)] p-6">
          <h1>{doc.title}</h1>
          <div className="leading-8 text-[var(--color-text-secondary)]" dangerouslySetInnerHTML={{ __html: `<p>${html}</p>` }} />
          {children}
        </article>
      </div>
    </section>
  );
}
