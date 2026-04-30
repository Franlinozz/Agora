import { EscrowState } from '@agora/shared';
import { Card, CardContent, CardHeader, cn } from '@agora/ui';

const states = [
  { id: EscrowState.Created, label: 'Created' },
  { id: EscrowState.Funded, label: 'Funded' },
  { id: EscrowState.Delivered, label: 'Delivered' },
  { id: EscrowState.Verified, label: 'Verified' },
  { id: EscrowState.Released, label: 'Released' },
];

export function StateMachine({ state }: { state: EscrowState }) {
  const activeIndex = states.findIndex((item) => item.id === state);
  const disputed = state === EscrowState.Disputed;
  return (
    <Card>
      <CardHeader><p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--color-arc-purple-light)]">{'//Lifecycle'}</p><h2 className="text-2xl font-semibold">Escrow state machine</h2></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <svg viewBox="0 0 760 220" className="min-w-[720px]" role="img" aria-label="Escrow state machine">
            <path d="M120 110H640" stroke="var(--color-bg-3)" strokeWidth="4" strokeLinecap="round" />
            <path d="M380 80 C380 30 520 30 520 80" fill="none" stroke="var(--color-warning)" strokeWidth="3" strokeDasharray="8 8" />
            <text x="450" y="28" textAnchor="middle" fill="var(--color-warning)" fontSize="13">Disputed branch</text>
            {states.map((item, index) => {
              const x = 100 + index * 140;
              const complete = !disputed && index <= activeIndex;
              return (
                <g key={item.label}>
                  <circle cx={x} cy="110" r="30" fill={complete ? 'var(--color-arc-purple)' : 'var(--color-bg-1)'} stroke={complete ? 'var(--color-arc-purple-light)' : 'var(--color-bg-3)'} strokeWidth="3" />
                  <text x={x} y="116" textAnchor="middle" fill="white" fontSize="14" fontWeight="700">{index + 1}</text>
                  <text x={x} y="165" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="13">{item.label}</text>
                </g>
              );
            })}
          </svg>
        </div>
        <p className={cn('mt-4 text-sm', disputed ? 'text-[var(--color-warning)]' : 'text-[var(--color-text-secondary)]')}>{disputed ? 'This escrow is currently in dispute.' : 'The highlighted nodes show current progress through escrow release.'}</p>
      </CardContent>
    </Card>
  );
}
