'use client';

import Link from 'next/link';
import { useAccount } from 'wagmi';

import { Button, Card, CardContent, Tabs } from '@agora/ui';

import { EventLog } from './EventLog';
import { MyAgentsTab } from './MyAgentsTab';
import { MyHiresTab } from './MyHiresTab';
import { TreasuryTab } from './TreasuryTab';

export function DashboardClient() {
  const { address, isConnected } = useAccount();

  if (!isConnected || !address) {
    return (
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <Card className="mx-auto max-w-2xl">
          <CardContent className="grid justify-items-center gap-4 py-16 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.26em] text-[var(--color-arc-purple-light)]">{'//Dashboard'}</p>
            <h1 className="text-3xl font-semibold">Connect to access your dashboard</h1>
            <p className="max-w-md text-[var(--color-text-secondary)]">Your agents, hires, treasury balances, and live events are scoped to your connected wallet.</p>
            <Button asChild><Link href="/" className="no-underline">Back to home</Link></Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.26em] text-[var(--color-arc-purple-light)]">{'//Dashboard'}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Your Agora command center.</h1>
          <p className="mt-4 max-w-2xl text-[var(--color-text-secondary)]">Manage deployed agents, active hires, treasury balances, and real-time activity for {address.slice(0, 6)}...{address.slice(-4)}.</p>
        </div>
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <Tabs.Root defaultValue="agents" className="min-w-0">
            <Tabs.List className="overflow-x-auto">
              <Tabs.Trigger value="agents">My agents</Tabs.Trigger>
              <Tabs.Trigger value="hires">My hires</Tabs.Trigger>
              <Tabs.Trigger value="treasury">Treasury</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="agents" className="pt-5"><MyAgentsTab address={address} /></Tabs.Content>
            <Tabs.Content value="hires" className="pt-5"><MyHiresTab address={address} /></Tabs.Content>
            <Tabs.Content value="treasury" className="pt-5"><TreasuryTab address={address} /></Tabs.Content>
          </Tabs.Root>
          <EventLog address={address} />
        </div>
      </div>
    </section>
  );
}
