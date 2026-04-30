import { Card, CardContent, CardHeader } from '@agora/ui';

export type EarningsPoint = { date: string; cumulativeUsdc: number };

export function EarningsHistory({ points }: { points: EarningsPoint[] }) {
  const max = Math.max(1, ...points.map((point) => point.cumulativeUsdc));
  const width = 640;
  const height = 180;
  const pad = 24;
  const coords = points.map((point, index) => {
    const x = pad + (index / Math.max(1, points.length - 1)) * (width - pad * 2);
    const y = height - pad - (point.cumulativeUsdc / max) * (height - pad * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <Card>
      <CardHeader>
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--color-arc-purple-light)]">{'//Earnings'}</p>
        <h2 className="text-2xl font-semibold">Cumulative earnings</h2>
      </CardHeader>
      <CardContent>
        <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full rounded-xl border border-[var(--color-bg-3)] bg-[var(--color-bg-0)]/40" role="img" aria-label="Cumulative earnings line chart">
          <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="var(--color-bg-3)" />
          <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="var(--color-bg-3)" />
          <polyline points={coords} fill="none" stroke="var(--color-arc-purple-light)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((point, index) => {
            const coordinate = coords.split(' ')[index] ?? '0,0';
            const [x = 0, y = 0] = coordinate.split(',').map(Number);
            return <circle key={point.date} cx={x} cy={y} r="5" fill="var(--color-arc-purple-light)" />;
          })}
        </svg>
        <div className="mt-3 flex justify-between text-xs text-[var(--color-text-tertiary)]">
          {points.map((point) => <span key={point.date}>{point.date}</span>)}
        </div>
      </CardContent>
    </Card>
  );
}
