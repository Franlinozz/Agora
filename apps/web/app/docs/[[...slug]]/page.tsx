import { notFound } from 'next/navigation';

import { BaseAppActionSkills } from '@/components/docs/BaseAppActionSkills';
import { DocsLayout } from '@/components/docs/DocsLayout';
import { getDoc, getDocs, renderMarkdown } from '@/lib/docs';

export default function DocsPage({ params }: { params: { slug?: string[] } }) {
  const doc = getDoc(params.slug);
  if (!doc) notFound();

  return (
    <DocsLayout docs={getDocs()} doc={doc} html={renderMarkdown(doc.body)}>
      {doc.slug === 'base-app-transaction-skills' ? <BaseAppActionSkills /> : null}
    </DocsLayout>
  );
}

export function generateStaticParams() { return getDocs().map((doc) => ({ slug: doc.slug.split('/') })); }
