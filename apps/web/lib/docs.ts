import fs from 'node:fs';
import path from 'node:path';

export type Doc = { slug: string; title: string; order: number; category: string; body: string };
const root = path.join(process.cwd(), 'content/docs');
function parse(file: string): Doc {
  const raw = fs.readFileSync(file, 'utf8');
  const [, front = '', body = raw] = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/) ?? [];
  const meta = Object.fromEntries(front.split('\n').filter(Boolean).map((line) => { const [k = '', ...v] = line.split(':'); return [k.trim(), v.join(':').trim()]; }));
  const rel = path.relative(root, file).replace(/\.md$/, '').split(path.sep).join('/');
  return { slug: rel, title: meta.title || rel, order: Number(meta.order || 999), category: meta.category || 'General', body };
}
function files(dir: string): string[] { return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => { const full = path.join(dir, entry.name); return entry.isDirectory() ? files(full) : entry.name.endsWith('.md') ? [full] : []; }); }
export function getDocs() { return files(root).map(parse).sort((a, b) => a.category.localeCompare(b.category) || a.order - b.order); }
export function getDoc(slugParts?: string[]) { const slug = slugParts?.join('/') || 'getting-started'; return getDocs().find((doc) => doc.slug === slug) ?? null; }
export function renderMarkdown(md: string) { return md.replace(/^### (.*)$/gm, '<h3>$1</h3>').replace(/^## (.*)$/gm, '<h2>$1</h2>').replace(/^# (.*)$/gm, '<h1>$1</h1>').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/^- (.*)$/gm, '<li>$1</li>').replace(/\n\n/g, '</p><p>'); }
