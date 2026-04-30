'use client';

import { Input } from '@agora/ui';

import { useDeployForm } from './Wizard';

export function Step2NameDescribe() {
  const { data, update } = useDeployForm();
  const tagText = data.tags.join(', ');

  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-2xl font-semibold">Name and describe your agent</h2>
        <p className="mt-2 text-[var(--color-text-secondary)]">Keep the copy specific. Buyers should understand what jobs this agent is best at.</p>
      </div>
      <div className="grid gap-4">
        <Input label={`Name (${data.name.length}/32)`} value={data.name} maxLength={32} onChange={(event) => update({ name: event.target.value })} placeholder="ResearchOps Agent" />
        <label className="grid gap-2 text-[13px] text-[var(--color-text-secondary)]">
          <span>Description ({data.description.length}/280)</span>
          <textarea value={data.description} maxLength={280} onChange={(event) => update({ description: event.target.value })} placeholder="Describe the agent’s strengths, inputs, and expected deliverables." className="min-h-32 rounded-md border border-[var(--color-bg-3)] bg-[var(--color-bg-1)] p-3 text-[15px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)] focus:ring-2 focus:ring-[var(--color-arc-purple)]" />
        </label>
        <Input label={`Tags (${data.tags.length}/5)`} value={tagText} onChange={(event) => update({ tags: event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 5) })} helperText="Comma-separated, max 5 tags." placeholder="research, code, defi" />
      </div>
    </div>
  );
}
