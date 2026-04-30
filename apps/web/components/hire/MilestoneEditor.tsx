'use client';

import { Plus, Trash2 } from 'lucide-react';

import { Button, Card, CardContent, Input } from '@agora/ui';

export type MilestoneDraft = { id: string; description: string; deadlineDays: string };

export function MilestoneEditor({ milestones, onChange }: { milestones: MilestoneDraft[]; onChange: (milestones: MilestoneDraft[]) => void }) {
  function add() {
    if (milestones.length >= 5) return;
    onChange([...milestones, { id: `milestone-${Date.now()}`, description: '', deadlineDays: '7' }]);
  }

  function update(id: string, patch: Partial<MilestoneDraft>) {
    onChange(milestones.map((milestone) => milestone.id === id ? { ...milestone, ...patch } : milestone));
  }

  function remove(id: string) {
    onChange(milestones.filter((milestone) => milestone.id !== id));
  }

  return (
    <Card>
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">Milestones</h3>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Optional advisory checklist. V1 escrow releases on full completion.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={add} disabled={milestones.length >= 5}><Plus className="size-4" /> Add</Button>
        </div>
        {milestones.length === 0 ? <p className="text-sm text-[var(--color-text-tertiary)]">No milestones added.</p> : null}
        {milestones.map((milestone, index) => (
          <div key={milestone.id} className="grid gap-3 rounded-lg border border-[var(--color-bg-3)] p-3 md:grid-cols-[1fr_140px_auto] md:items-end">
            <Input label={`Milestone ${index + 1}`} value={milestone.description} onChange={(event) => update(milestone.id, { description: event.target.value })} placeholder="Draft delivered" />
            <Input type="number" min="1" max="30" label="Due in" suffix="days" value={milestone.deadlineDays} onChange={(event) => update(milestone.id, { deadlineDays: event.target.value })} />
            <Button variant="ghost" size="sm" onClick={() => remove(milestone.id)}><Trash2 className="size-4" /></Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
