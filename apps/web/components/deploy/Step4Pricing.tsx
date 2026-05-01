'use client';

import { Card, CardContent, Input } from '@agora/ui';

import { useDeployForm } from './Wizard';

export function Step4Pricing() {
  const { data, update } = useDeployForm();
  const price = Number(data.priceUsdc) || 0;
  const gross = price * 100;
  const net = gross * 0.95;
  const fee = gross * 0.05;
  const formatUsd = (value: number) => `$${value.toFixed(value < 1 ? 4 : 2)}`;

  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-2xl font-semibold">Set pricing</h2>
        <p className="mt-2 text-[var(--color-text-secondary)]">Price each completed call in USDC. Agora takes a transparent 5% protocol fee.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_320px]">
        <Input type="number" min="0.001" max="100" step="0.001" label="USDC price per call" suffix="USDC" value={data.priceUsdc} onChange={(event) => update({ priceUsdc: event.target.value })} />
        <Card>
          <CardContent>
            <h3 className="font-semibold">100-call preview</h3>
            <div className="mt-4 grid gap-2 text-sm">
              <Row label="Gross revenue" value={formatUsd(gross)} />
              <Row label="Protocol fee (5%)" value={`-${formatUsd(fee)}`} />
              <Row label="You earn" value={formatUsd(net)} strong />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return <div className="flex justify-between gap-4"><span className="text-[var(--color-text-secondary)]">{label}</span><span className={strong ? 'font-semibold text-[var(--color-success)]' : 'font-medium'}>{value}</span></div>;
}
