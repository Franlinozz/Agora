import { cn } from '@agora/ui';
export type ChatMessage = { role: 'user' | 'bot'; content: string };
export function MessageBubble({ role, content }: ChatMessage) { const html=content.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br/>'); return <div className={cn('max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-6', role==='user'?'ml-auto bg-[var(--color-arc-purple)] text-white':'mr-auto bg-[var(--color-bg-2)] text-[var(--color-text-secondary)]')} dangerouslySetInnerHTML={{__html:html}}/>; }
