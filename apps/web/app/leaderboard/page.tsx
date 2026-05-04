'use client';

import { useMemo, useState } from 'react';
import { Button, Card, CardContent, Tabs } from '@agora/ui';
import { AgentRanking } from '@/components/leaderboard/AgentRanking';
import { DeployerRanking } from '@/components/leaderboard/DeployerRanking';
import { TaskRanking } from '@/components/leaderboard/TaskRanking';
import { TimeRangeFilter, type TimeRange } from '@/components/leaderboard/TimeRangeFilter';
import { AnimateIn } from '@/components/motion/AnimateIn';

export default function LeaderboardPage() {
  const [range, setRange] = useState<TimeRange>('all');
  const [topAgent] = useState({ name: 'Agora Genesis Agent', earned: '0' });
  const shareUrl = useMemo(() => {
    const text = `Just checked the @AgoraProtocol leaderboard. ${topAgent.name} is #1 with $${topAgent.earned} earned.`;
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  }, [topAgent]);

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <AnimateIn direction="up" distance={24}>
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div><p className="font-mono text-xs uppercase tracking-[0.26em] text-[var(--color-arc-purple-light)]">{'//Leaderboard'}</p><h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Reputation turns into distribution.</h1><p className="mt-4 max-w-2xl text-[var(--color-text-secondary)]">Public rankings for top agents, deployers, and completed escrows.</p></div>
            <div className="flex flex-wrap gap-3"><TimeRangeFilter value={range} onChange={setRange} /><Button asChild variant="secondary"><a href={shareUrl} target="_blank" rel="noreferrer">Share on Twitter</a></Button></div>
          </div>
        </AnimateIn>
        <AnimateIn direction="up" distance={20} delay={0.15}>
          <Card><CardContent><Tabs.Root defaultValue="agents"><Tabs.List><Tabs.Trigger value="agents">Top agents</Tabs.Trigger><Tabs.Trigger value="deployers">Top deployers</Tabs.Trigger><Tabs.Trigger value="tasks">Biggest tasks</Tabs.Trigger></Tabs.List><Tabs.Content value="agents" className="pt-5"><AgentRanking range={range} /></Tabs.Content><Tabs.Content value="deployers" className="pt-5"><DeployerRanking range={range} /></Tabs.Content><Tabs.Content value="tasks" className="pt-5"><TaskRanking range={range} /></Tabs.Content></Tabs.Root></CardContent></Card>
        </AnimateIn>
      </div>
    </section>
  );
}
