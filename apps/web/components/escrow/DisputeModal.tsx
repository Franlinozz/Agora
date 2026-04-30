'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Button, Modal, toast } from '@agora/ui';

export function DisputeModal({ escrowId, buyer, agentOwner }: { escrowId: string; buyer: string; agentOwner: string }) {
  const { address } = useAccount();
  const [reason, setReason] = useState('');
  const authorized = !!address && [buyer.toLowerCase(), agentOwner.toLowerCase()].includes(address.toLowerCase());

  function submit() {
    toast.info(`Dispute for escrow #${escrowId} will be submitted once contract wiring is active.`);
    setReason('');
  }

  if (!authorized) return null;
  return (
    <Modal.Root>
      <Modal.Trigger asChild><Button variant="danger" className="w-full">Open dispute</Button></Modal.Trigger>
      <Modal.Content>
        <Modal.Title className="text-xl font-semibold">Dispute escrow #{escrowId}</Modal.Title>
        <div className="mt-4 grid gap-4"><textarea maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Explain what went wrong…" className="min-h-32 rounded-md border border-[var(--color-bg-3)] bg-[var(--color-bg-0)] p-3 text-sm outline-none" /><Button onClick={submit} disabled={!reason.trim()}>Submit dispute</Button><Modal.Close asChild><Button variant="secondary">Cancel</Button></Modal.Close></div>
      </Modal.Content>
    </Modal.Root>
  );
}
