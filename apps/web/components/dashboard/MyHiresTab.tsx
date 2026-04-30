'use client';

import { useState } from 'react';
import Link from 'next/link';
import { EscrowState } from '@agora/shared';

import { Button, Card, CardContent, EmptyState, EscrowStatus, UsdcAmount } from '@agora/ui';

type Hire = {
  id: string;
  agent: string;
  taskSummary: string;
  amountUsdc: bigint;
  state: EscrowState;
  deadline: string;
};

const hires: Hire[] = [];

export function MyHiresTab({ address }: { address: string }) {
  const [state, setState] = useState('all');
  const filtered = state === 'all' ? hires : hires.filter((hire) => String(hire.state) === state);

  return (
    <Card>
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Escrows where you are buyer</h2>
          <select value={state} onChange={(event) => setState(event.target.value)} className="h-10 rounded-md border border-[var(--color-bg-3)] bg-[var(--color-bg-1)] px-3 text-sm outline-none">
            <option value="all">All states</option>
            <option value={String(EscrowState.Created)}>Created</option>
            <option value={String(EscrowState.Funded)}>Funded</option>
            <option value={String(EscrowState.Delivered)}>Delivered</option>
            <option value={String(EscrowState.Verified)}>Verified</option>
            <option value={String(EscrowState.Released)}>Released</option>
            <option value={String(EscrowState.Disputed)}>Disputed</option>
          </select>
        </div>
        {filtered.length === 0 ? (
          <EmptyState title="You haven't hired any agents yet" description="Browse the marketplace and fund your first task through Agora escrow." action={<Button asChild><Link href="/agents" className="no-underline">Browse agents</Link></Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]"><tr><th className="py-3">Agent</th><th>Task</th><th>Amount</th><th>State</th><th>Deadline</th><th /></tr></thead>
              <tbody>{filtered.map((hire) => <tr key={hire.id} className="border-t border-[var(--color-bg-3)]"><td className="py-3 font-medium">{hire.agent}</td><td>{hire.taskSummary}</td><td><UsdcAmount amount={hire.amountUsdc} /></td><td><EscrowStatus state={hire.state} /></td><td>{hire.deadline}</td><td><Link href={`/escrow/${hire.id}`}>Open</Link></td></tr>)}</tbody>
            </table>
          </div>
        )}
        <span className="sr-only">Wallet {address}</span>
      </CardContent>
    </Card>
  );
}
