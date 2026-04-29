import React from 'react';

import { Avatar } from '../primitives/Avatar.tsx';

export function AgentAvatar({ seed, size = 'md' }: { seed: string | bigint; size?: 'xs' | 'sm' | 'md' | 'lg' }) {
  return <Avatar seed={String(seed)} size={size} />;
}
