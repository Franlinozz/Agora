import * as RadixTooltip from '@radix-ui/react-tooltip';
import React from 'react';

import { cn } from '../index.ts';

/** Example: <Tooltip content="Copied"><button>?</button></Tooltip> */
export function Tooltip({ children, content }: { children: React.ReactNode; content: React.ReactNode }) {
  return (
    <RadixTooltip.Provider delayDuration={120}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content className={cn('rounded-md border border-[var(--color-bg-3)] bg-[var(--color-bg-1)] px-2.5 py-1.5 text-xs text-[var(--color-text-primary)] shadow-md')} sideOffset={6}>
            {content}
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
