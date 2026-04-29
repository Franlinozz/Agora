import * as RadixTabs from '@radix-ui/react-tabs';
import React from 'react';

import { cn } from '../index.ts';

/** Example: <Tabs.Root defaultValue="a"><Tabs.List><Tabs.Trigger value="a">A</Tabs.Trigger></Tabs.List></Tabs.Root> */
function List({ className, ...props }: RadixTabs.TabsListProps) {
  return <RadixTabs.List className={cn('flex border-b border-[var(--color-bg-3)]', className)} {...props} />;
}
function Trigger({ className, ...props }: RadixTabs.TabsTriggerProps) {
  return <RadixTabs.Trigger className={cn('border-b-2 border-transparent px-4 py-2 text-sm text-[var(--color-text-secondary)] data-[state=active]:border-[var(--color-arc-purple)] data-[state=active]:text-[var(--color-text-primary)]', className)} {...props} />;
}
export const Tabs = { Root: RadixTabs.Root, List, Trigger, Content: RadixTabs.Content };
