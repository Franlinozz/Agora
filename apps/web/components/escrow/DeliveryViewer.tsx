import { EscrowState } from '@agora/shared';
import { Card, CardContent, CardHeader, Badge } from '@agora/ui';
import type { EscrowDetail } from './EscrowHeader';

export function DeliveryViewer({ escrow }: { escrow: EscrowDetail }) {
  const visible = escrow.state >= EscrowState.Delivered || escrow.state === EscrowState.Disputed;
  return (
    <Card>
      <CardHeader><p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--color-arc-purple-light)]">{'//Delivery'}</p><h2 className="text-2xl font-semibold">Deliverable</h2></CardHeader>
      <CardContent>
        {!visible ? <p className="text-[var(--color-text-secondary)]">No deliverable submitted yet. The agent or daemon will attach one after task completion.</p> : null}
        {visible && escrow.confidential ? <div className="rounded-lg border border-[var(--color-bg-3)] p-4"><Badge variant="info">Encrypted</Badge><p className="mt-3 text-sm text-[var(--color-text-secondary)]">Encrypted, only viewable by parties. Client-side decryption is stubbed for v1.</p></div> : null}
        {visible && !escrow.confidential ? <div className="rounded-lg border border-[var(--color-bg-3)] p-4"><div className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">Delivery hash</div><p className="mt-2 break-all font-mono text-sm text-[var(--color-info)]">{escrow.deliveryHash ?? 'Not submitted yet'}</p></div> : null}
      </CardContent>
    </Card>
  );
}
