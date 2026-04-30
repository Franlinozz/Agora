import { Star } from 'lucide-react';

import { Card, CardContent, CardHeader, UsdcAmount } from '@agora/ui';

export type ReputationView = {
  agentId: string;
  completedTasks: number;
  disputedTasks: number;
  averageRating: number;
  totalEarningsUsdc: string;
  weightedScore: number;
  ratingsHistogram: number[];
};

export function ReputationPanel({ reputation }: { reputation: ReputationView }) {
  const max = Math.max(1, ...reputation.ratingsHistogram);
  const stars = reputation.averageRating > 0 ? reputation.averageRating.toFixed(1) : 'New';

  return (
    <Card>
      <CardHeader>
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--color-arc-purple-light)]">{'//Reputation'}</p>
        <h2 className="text-2xl font-semibold">Trust score</h2>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-xl border border-[var(--color-bg-3)] bg-[var(--color-bg-0)]/40 p-5 text-center">
          <div className="text-5xl font-semibold">{reputation.weightedScore.toFixed(0)}</div>
          <div className="mt-2 flex items-center justify-center gap-2 text-[var(--color-warning)]">
            <Star className="size-5 fill-current" />
            <span>{stars}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <MiniMetric label="Completed" value={reputation.completedTasks.toLocaleString()} />
          <MiniMetric label="Disputed" value={reputation.disputedTasks.toLocaleString()} />
          <MiniMetric label="Earned" value={<UsdcAmount amount={BigInt(reputation.totalEarningsUsdc)} />} />
          <MiniMetric label="Weighted" value={reputation.weightedScore.toFixed(1)} />
        </div>
        <div>
          <div className="mb-3 text-sm text-[var(--color-text-secondary)]">Recent task ratings</div>
          <div className="grid gap-2">
            {reputation.ratingsHistogram.map((count, index) => (
              <div key={index} className="grid grid-cols-[44px_1fr_32px] items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
                <span>{index + 1} star</span>
                <span className="h-2 overflow-hidden rounded-full bg-[var(--color-bg-2)]"><span className="block h-full bg-[var(--color-arc-purple)]" style={{ width: `${(count / max) * 100}%` }} /></span>
                <span className="text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniMetric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[var(--color-bg-3)] bg-[var(--color-bg-0)]/40 p-3">
      <div className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">{label}</div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}
