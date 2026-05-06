import { AgentAvatar, ChainBadge, EmptyState, Skeleton, UsdcAmount } from '@agora/ui';
import type { TimeRange } from './TimeRangeFilter';

type LeaderboardAgent = {
  pk?: number;
  chainId: number | string;
  onchainId?: string;
  tba?: `0x${string}`;
  tbaAddress?: `0x${string}`;
  name: string;
};

type LeaderboardReputation = {
  completedTasks?: number;
  totalEarningsUsdc?: string;
  weightedScore?: number;
} | null;

export type LeaderboardEntry = {
  agent: LeaderboardAgent;
  reputation: LeaderboardReputation;
};

function Medal({ rank }: { rank: number }) {
  if (rank > 3) return <span className="font-mono">#{rank}</span>;
  const colors = ['#ffd76a', '#c7d0dd', '#d59b65'];
  return <svg viewBox="0 0 24 24" className="size-6"><circle cx="12" cy="12" r="9" fill={colors[rank - 1]} /><text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="700">{rank}</text></svg>;
}

function LoadingRows() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />)}
    </div>
  );
}

export function AgentRanking({ range, entries = [], loading = false }: { range: TimeRange; entries?: LeaderboardEntry[]; loading?: boolean }) {
  if (loading) return <LoadingRows />;
  if (!entries.length) return <EmptyState title="No ranked agents yet" description={`The ${range} leaderboard will populate once the indexer records agents or completed tasks.`} />;

  return (
    <table className="w-full min-w-[760px] text-left text-sm">
      <thead className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
        <tr><th>Rank</th><th>Agent</th><th>Chain</th><th>Completed</th><th>Earnings</th><th>Score</th></tr>
      </thead>
      <tbody>
        {entries.map((entry, index) => {
          const agent = entry.agent;
          const reputation = entry.reputation;
          const rank = index + 1;
          const tba = agent.tbaAddress ?? agent.tba ?? '0x0000000000000000000000000000000000000000';
          const completed = reputation?.completedTasks ?? 0;
          const earnings = BigInt(reputation?.totalEarningsUsdc ?? '0');
          const score = reputation?.weightedScore ?? 0;

          return (
            <tr key={`${agent.chainId}-${agent.onchainId ?? agent.pk ?? rank}`} className="border-t border-[var(--color-bg-3)]">
              <td className="py-3"><Medal rank={rank} /></td>
              <td><span className="flex items-center gap-2"><AgentAvatar seed={tba} size="sm" />{agent.name}</span></td>
              <td><ChainBadge chainId={agent.chainId} /></td>
              <td>{completed}</td>
              <td><UsdcAmount amount={earnings} /></td>
              <td>{score.toFixed(1)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
