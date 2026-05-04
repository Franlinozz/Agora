'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@agora/ui';

export type ChatMessage = { role: 'user' | 'bot'; content: string };

/** Renders a single message bubble with typewriter effect for bot messages */
export function MessageBubble({ role, content }: ChatMessage) {
  const isBot = role === 'bot';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-6',
        isBot
          ? 'mr-auto bg-[var(--color-bg-2)] text-[var(--color-text-secondary)]'
          : 'ml-auto bg-[var(--color-arc-purple)] text-white',
      )}
    >
      {isBot ? <TypewriterText text={content} /> : <FormattedText text={content} />}
    </motion.div>
  );
}

/** Static formatted text (for user messages) */
function FormattedText({ text }: { text: string }) {
  const html = text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Typewriter effect that gradually reveals bot text */
function TypewriterText({ text }: { text: string }) {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayedLength(0);
    setDone(false);
    let i = 0;
    const totalLength = text.length;

    const timer = setInterval(() => {
      // Speed: 3 chars per tick for snappy feel, not sluggish
      i = Math.min(i + 3, totalLength);
      setDisplayedLength(i);
      if (i >= totalLength) {
        setDone(true);
        clearInterval(timer);
      }
    }, 18);

    return () => clearInterval(timer);
  }, [text]);

  const displayed = text.slice(0, displayedLength);
  const html = displayed
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');

  return (
    <span>
      <span dangerouslySetInnerHTML={{ __html: html }} />
      {!done && (
        <motion.span
          className="ml-0.5 inline-block h-4 w-[2px] bg-[var(--color-arc-purple-light)]"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </span>
  );
}
