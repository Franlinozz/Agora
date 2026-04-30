'use client';

import { Plus, Trash2 } from 'lucide-react';

import { Button, Card, CardContent, Input } from '@agora/ui';

import { type DeployCapabilityDraft, useDeployForm } from './Wizard';

function isValidJson(value: string) {
  try { JSON.parse(value); return true; } catch { return false; }
}

export function Step3Capabilities() {
  const { data, update } = useDeployForm();

  function updateCapability(id: string, patch: Partial<DeployCapabilityDraft>) {
    update({ capabilities: data.capabilities.map((capability) => capability.id === id ? { ...capability, ...patch } : capability) });
  }

  function addCapability() {
    update({ capabilities: [...data.capabilities, { id: `capability-${Date.now()}`, name: '', description: '', inputSchema: '{\n  "type": "object",\n  "properties": {}\n}', outputSchema: '{\n  "type": "object",\n  "properties": {}\n}' }] });
  }

  function removeCapability(id: string) {
    update({ capabilities: data.capabilities.length === 1 ? data.capabilities : data.capabilities.filter((capability) => capability.id !== id) });
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Define capabilities</h2>
          <p className="mt-2 text-[var(--color-text-secondary)]">Each capability needs valid JSON schemas so buyers and daemon workers know the contract.</p>
        </div>
        <Button variant="secondary" onClick={addCapability}><Plus className="size-4" /> Add capability</Button>
      </div>
      <div className="grid gap-4">
        {data.capabilities.map((capability, index) => (
          <Card key={capability.id}>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold">Capability {index + 1}</h3>
                <Button variant="ghost" size="sm" onClick={() => removeCapability(capability.id)} disabled={data.capabilities.length === 1}><Trash2 className="size-4" /> Remove</Button>
              </div>
              <Input label="Name" value={capability.name} onChange={(event) => updateCapability(capability.id, { name: event.target.value })} placeholder="Research synthesis" />
              <label className="grid gap-2 text-[13px] text-[var(--color-text-secondary)]">
                <span>Description</span>
                <textarea value={capability.description} onChange={(event) => updateCapability(capability.id, { description: event.target.value })} className="min-h-20 rounded-md border border-[var(--color-bg-3)] bg-[var(--color-bg-1)] p-3 text-[15px] text-[var(--color-text-primary)] outline-none focus:ring-2 focus:ring-[var(--color-arc-purple)]" />
              </label>
              <div className="grid gap-4 lg:grid-cols-2">
                <SchemaEditor label="Input schema" value={capability.inputSchema} onChange={(value) => updateCapability(capability.id, { inputSchema: value })} />
                <SchemaEditor label="Output schema" value={capability.outputSchema} onChange={(value) => updateCapability(capability.id, { outputSchema: value })} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SchemaEditor({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const valid = isValidJson(value);
  return (
    <label className="grid gap-2 text-[13px] text-[var(--color-text-secondary)]">
      <span className="flex items-center justify-between">{label}<span className={valid ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}>{valid ? 'Valid JSON' : 'Invalid JSON'}</span></span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} spellCheck={false} className="min-h-48 rounded-md border border-[var(--color-bg-3)] bg-[var(--color-bg-0)] p-3 font-mono text-xs leading-6 text-[var(--color-text-primary)] outline-none focus:ring-2 focus:ring-[var(--color-arc-purple)]" />
    </label>
  );
}
