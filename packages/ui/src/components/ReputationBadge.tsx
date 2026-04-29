import type { Reputation } from '@agora/shared';
import { Star } from 'lucide-react';
import React from 'react';


import { Badge } from '../primitives/Badge.tsx';

export function ReputationBadge({ reputation }: { reputation?: Reputation }) {
  if (!reputation || reputation.completedTasks === 0) return <Badge>New</Badge>;
  return (
    <Badge variant="success">
      <Star className="size-3 fill-current" /> {reputation.averageRating.toFixed(1)} · {reputation.completedTasks} done
    </Badge>
  );
}
