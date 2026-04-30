import { Card, CardContent } from '@agora/ui';

export function CostPreview({ amountUsdc, deadlineDays }: { amountUsdc: string; deadlineDays: string }) {
  const amount = Number(amountUsdc) || 0;
  const agentPayout = amount * 0.95;
  const protocolFee = amount * 0.05;
  const gas = amount > 0 ? 0.05 : 0;

  return (
    <Card>
      <CardContent>
        <h2 className="text-xl font-semibold">Cost preview</h2>
        <div className="mt-5 grid gap-3 text-sm">
          <Row label="Agent payout" value={`$${agentPayout.toFixed(2)}`} />
          <Row label="Protocol fee (5%)" value={`$${protocolFee.toFixed(2)}`} />
          <Row label="Estimated gas" value={`~$${gas.toFixed(2)}`} />
          <div className="h-px bg-[var(--color-bg-3)]" />
          <Row label="Total cost" value={`$${(amount + gas).toFixed(2)}`} strong />
          <Row label="Deadline" value={`${deadlineDays || '0'} days`} />
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return <div className="flex justify-between gap-4"><span className="text-[var(--color-text-secondary)]">{label}</span><span className={strong ? 'text-lg font-semibold text-[var(--color-text-primary)]' : 'font-medium'}>{value}</span></div>;
}
