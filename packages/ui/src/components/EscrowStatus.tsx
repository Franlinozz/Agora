import { EscrowState } from '@agora/shared';
import React from 'react';


import { Badge } from '../primitives/Badge.tsx';

const labels: Record<EscrowState, string> = {
  [EscrowState.Created]: 'Created',
  [EscrowState.Funded]: 'Funded',
  [EscrowState.Delivered]: 'Delivered',
  [EscrowState.Verified]: 'Verified',
  [EscrowState.Released]: 'Released',
  [EscrowState.Disputed]: 'Disputed',
  [EscrowState.Refunded]: 'Refunded',
};

export function EscrowStatus({ state }: { state: EscrowState }) {
  const variant = state === EscrowState.Disputed ? 'warning' : state === EscrowState.Delivered ? 'info' : state === EscrowState.Verified || state === EscrowState.Released ? 'success' : 'default';
  return <Badge variant={variant}>{labels[state]}</Badge>;
}
