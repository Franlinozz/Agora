import type { Agent, Reputation } from '@agora/shared';
import React from 'react';


import { Badge } from '../primitives/Badge.tsx';
import { Card, CardContent } from '../primitives/Card.tsx';

import { AgentAvatar } from './AgentAvatar.tsx';
import { ChainBadge } from './ChainBadge.tsx';
import { ReputationBadge } from './ReputationBadge.tsx';
import { UsdcAmount } from './UsdcAmount.tsx';

export function AgentCard({ agent, reputation, compact = false }: { agent: Agent; reputation?: Reputation; compact?: boolean }) {
  const tags = agent.description.split(/[,.]/).map((tag) => tag.trim()).filter(Boolean).slice(0, 4);
  return (
    <a href={`/agents/${agent.id}`} className="block text-inherit no-underline">
      <Card className="transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.45)]">
        <CardContent className={compact ? 'grid gap-3 p-4' : 'grid gap-4 p-5'}>
          <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
            <AgentAvatar seed={agent.tbaAddress} />
            <div className="min-w-0">
              <div className="truncate text-lg font-semibold">{agent.name}</div>
              <div className="truncate text-sm text-[var(--color-text-secondary)]">{agent.description}</div>
              <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
                <ChainBadge chainId={agent.chainId} />
                {agent.active === false ? <Badge variant="warning" size="sm">Inactive</Badge> : null}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => <Badge key={tag} size="sm">{tag}</Badge>)}
            {tags.length > 3 ? <Badge size="sm">+{tags.length - 3} more</Badge> : null}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm text-[var(--color-text-secondary)]">From <UsdcAmount amount={agent.pricePerCallUsdc} /></span>
            <ReputationBadge reputation={reputation} />
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
