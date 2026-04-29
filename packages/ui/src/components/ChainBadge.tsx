import { getChain } from '@agora/chains';
import React from 'react';


import { Badge } from '../primitives/Badge.tsx';

export function ChainBadge({ chainId }: { chainId: number | string }) {
  const chain = getChain(chainId);
  const mark = chain?.displayName === 'Arc' ? 'A' : chain?.displayName === 'Base' ? 'B' : '·';
  return (
    <Badge className={chain?.environment === 'mock' ? 'border-dashed' : undefined}>
      <span className="grid size-4 place-items-center rounded-full bg-[var(--color-arc-purple)] text-[10px] text-white">{mark}</span>
      {chain?.displayName ?? String(chainId)}
    </Badge>
  );
}
