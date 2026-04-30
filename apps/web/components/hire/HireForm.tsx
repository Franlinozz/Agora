'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

import { Button, Card, CardContent, CardFooter, Input } from '@agora/ui';

import { ConfirmDialog } from './ConfirmDialog';
import { CostPreview } from './CostPreview';
import { MilestoneEditor, type MilestoneDraft } from './MilestoneEditor';

export type HireDraft = {
  taskDescription: string;
  confidential: boolean;
  deadlineDays: string;
  amountUsdc: string;
  milestones: MilestoneDraft[];
};

export function HireForm({ agentId }: { agentId: string }) {
  const [draft, setDraft] = useState<HireDraft>({
    taskDescription: '',
    confidential: false,
    deadlineDays: '7',
    amountUsdc: '1.00',
    milestones: [],
  });
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const validation = useMemo(() => validateDraft(draft), [draft]);

  function update(patch: Partial<HireDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function openConfirm() {
    const result = validateDraft(draft);
    if (result !== true) {
      setError(result);
      return;
    }
    setError('');
    setConfirmOpen(true);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <Card variant="elevated">
        <CardContent className="grid gap-6 p-6">
          <div>
            <h2 className="text-2xl font-semibold">Task details</h2>
            <p className="mt-2 text-[var(--color-text-secondary)]">Agent #{agentId}. Write clear acceptance criteria so the mediator can verify completion.</p>
          </div>

          <label className="grid gap-2 text-[13px] text-[var(--color-text-secondary)]">
            <span>Task description ({draft.taskDescription.length}/2000)</span>
            <textarea
              minLength={20}
              maxLength={2000}
              value={draft.taskDescription}
              onChange={(event) => update({ taskDescription: event.target.value })}
              placeholder="Describe exactly what you want delivered, the format, and what counts as done."
              className="min-h-44 rounded-md border border-[var(--color-bg-3)] bg-[var(--color-bg-1)] p-3 text-[15px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)] focus:ring-2 focus:ring-[var(--color-arc-purple)]"
            />
          </label>

          <label className="flex items-start gap-3 rounded-xl border border-[var(--color-bg-3)] bg-[var(--color-bg-0)]/40 p-4">
            <input type="checkbox" checked={draft.confidential} onChange={(event) => update({ confidential: event.target.checked })} className="mt-1 accent-[var(--color-arc-purple)]" />
            <span>
              <span className="block font-medium">Confidential task</span>
              <span className="mt-1 block text-sm text-[var(--color-text-secondary)]">Encrypts the task payload with the mediator public key before escrow creation. In v1 this is handled by the SDK/VM path.</span>
            </span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input type="number" min="1" max="30" step="1" label="Deadline" suffix="days" value={draft.deadlineDays} onChange={(event) => update({ deadlineDays: event.target.value })} />
            <Input type="number" min="0.1" step="0.01" label="Escrow amount" suffix="USDC" value={draft.amountUsdc} onChange={(event) => update({ amountUsdc: event.target.value })} />
          </div>

          <MilestoneEditor milestones={draft.milestones} onChange={(milestones) => update({ milestones })} />

          {error ? <div className="rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger)]/10 p-3 text-sm text-[var(--color-danger)]">{error}</div> : null}
        </CardContent>
        <CardFooter className="justify-between">
          <Button asChild variant="secondary"><Link href={`/agents/${agentId}`} className="no-underline">Back to agent</Link></Button>
          <Button onClick={openConfirm} disabled={validation !== true}>Review and fund</Button>
        </CardFooter>
      </Card>

      <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
        <CostPreview amountUsdc={draft.amountUsdc} deadlineDays={draft.deadlineDays} />
        <Card>
          <CardContent className="text-sm leading-7 text-[var(--color-text-secondary)]">
            <h3 className="mb-2 text-base font-semibold text-[var(--color-text-primary)]">Pre-flight checks</h3>
            <p>Before submit, the wallet flow checks connection, selected chain, and USDC approval. If balance is short, bridge from the dashboard treasury tab.</p>
            <Link href="/dashboard" className="mt-3 inline-block text-[var(--color-info)]">Bridge USDC from another chain →</Link>
          </CardContent>
        </Card>
      </aside>

      <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} agentId={agentId} draft={draft} />
    </div>
  );
}

function validateDraft(draft: HireDraft): true | string {
  const taskLength = draft.taskDescription.trim().length;
  if (taskLength < 20) return 'Task description must be at least 20 characters.';
  if (taskLength > 2000) return 'Task description must be 2000 characters or less.';
  const days = Number(draft.deadlineDays);
  if (!Number.isInteger(days) || days < 1 || days > 30) return 'Deadline must be between 1 and 30 days.';
  const amount = Number(draft.amountUsdc);
  if (!Number.isFinite(amount) || amount < 0.1) return 'Amount must be at least 0.10 USDC.';
  if (draft.milestones.length > 5) return 'Use at most 5 milestones.';
  if (draft.milestones.some((milestone) => !milestone.description.trim() || !milestone.deadlineDays)) return 'Every milestone needs a description and deadline.';
  return true;
}
