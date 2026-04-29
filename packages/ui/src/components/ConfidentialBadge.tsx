import { Lock } from 'lucide-react';
import React from 'react';

import { Badge } from '../primitives/Badge.tsx';

export function ConfidentialBadge() {
  return (
    <Badge variant="info">
      <Lock className="size-3" /> Confidential
    </Badge>
  );
}
