import React from 'react';

/** Example: <Avatar seed="0xabc" size="md" /> */
export function Avatar({ seed, size = 'md', className }: { seed: string; size?: 'xs' | 'sm' | 'md' | 'lg'; className?: string }) {
  const px = { xs: 24, sm: 32, md: 40, lg: 56 }[size];
  const hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;
  return (
    <svg width={px} height={px} viewBox="0 0 40 40" className={className} role="img" aria-label="Avatar">
      <defs>
        <linearGradient id={`avatar-${hash}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={`hsl(${hue} 80% 62%)`} />
          <stop offset="100%" stopColor={`hsl(${(hue + 72) % 360} 80% 62%)`} />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill={`url(#avatar-${hash})`} />
      <circle cx={(hash % 18) + 10} cy="14" r="8" fill="rgba(255,255,255,0.24)" />
      <rect x="10" y={(hash % 10) + 18} width="20" height="10" rx="5" fill="rgba(10,11,30,0.28)" />
    </svg>
  );
}
