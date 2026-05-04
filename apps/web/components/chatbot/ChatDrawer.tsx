'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Sparkles } from 'lucide-react';
import { Button, cn } from '@agora/ui';
import { MessageBubble, type ChatMessage } from './MessageBubble';
import { askFaq } from '@/lib/chatbot/faq-index';

type StoredMessage = ChatMessage & { id: string };

export function ChatDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setMessages(JSON.parse(sessionStorage.getItem('agora-chat') || '[]') as StoredMessage[]);
    }
  }, [open]);

  useEffect(() => {
    sessionStorage.setItem('agora-chat', JSON.stringify(messages.slice(-50)));
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question) return;
    const user = { id: `u-${Date.now()}`, role: 'user' as const, content: question };
    setMessages((m) => [...m, user]);
    setInput('');
    setLoading(true);
    try {
      const faq = await askFaq(question);
      let answer: string = faq ?? '';
      if (!answer) {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, history: messages.slice(-8) }),
        });
        const data = await res.json();
        answer = data.message || data.answer || "I'm taking a break for the day. Try the docs or Discord.";
      }
      setMessages((m) => [...m, { id: `b-${Date.now()}`, role: 'bot', content: answer }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-24 right-5 z-50 flex h-[min(520px,80vh)] w-[min(380px,calc(100vw-40px))] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[var(--color-bg-0)]/80 shadow-[0_32px_80px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-xl"
        >
          {/* Header */}
          <header className="flex items-center gap-3 border-b border-white/[0.06] bg-gradient-to-r from-[var(--color-arc-purple)]/10 to-transparent px-4 py-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--color-arc-purple)]/20">
              <Sparkles className="size-4 text-[var(--color-arc-purple-light)]" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Ask Agora</h2>
              <p className="text-[11px] text-[var(--color-text-tertiary)]">AI-powered assistant</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="grid size-7 place-items-center rounded-lg text-[var(--color-text-tertiary)] transition hover:bg-white/[0.06] hover:text-[var(--color-text-primary)]"
            >
              <X className="size-4" />
            </button>
          </header>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-auto px-4 py-4 scrollbar-thin">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--color-arc-purple)]/15">
                  <Sparkles className="size-6 text-[var(--color-arc-purple-light)]" />
                </div>
                <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  Ask me about deploying agents, escrow, fees, supported chains, or confidential mode.
                </p>
              </div>
            ) : null}
            {messages.map((m) => (
              <MessageBubble key={m.id} role={m.role} content={m.content} />
            ))}
            {loading ? <ThinkingIndicator /> : null}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <form onSubmit={send} className="flex items-center gap-2 border-t border-white/[0.06] bg-[var(--color-bg-1)]/50 px-3 py-2.5">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              className="min-w-0 flex-1 rounded-xl border border-white/[0.06] bg-[var(--color-bg-1)] px-3.5 py-2 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-arc-purple)]/40 focus:ring-1 focus:ring-[var(--color-arc-purple)]/20"
            />
            <Button type="submit" size="sm" className="shrink-0 rounded-xl">
              <Send className="size-4" />
            </Button>
          </form>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

/** Animated thinking dots */
function ThinkingIndicator() {
  return (
    <div className="mr-auto flex max-w-[86%] items-center gap-1.5 rounded-2xl bg-[var(--color-bg-2)] px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block size-2 rounded-full bg-[var(--color-arc-purple-light)]"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1.1, 0.85] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}
