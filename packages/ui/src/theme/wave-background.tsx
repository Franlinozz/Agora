import React from 'react';

/**
 * Subtle wavy background. Place once near the root of the app layout.
 * Renders fixed-position behind all content at very low opacity.
 * Pure inline SVG, no images, no extra requests.
 */
export function WaveBackground({ opacity = 0.05 }: { opacity?: number }) {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        opacity,
        background: 'var(--color-bg-0)',
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="wave-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-arc-purple)" stopOpacity="0.6" />
            <stop offset="50%" stopColor="var(--color-info)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--color-arc-purple-light)" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <path
          d="M0,450 C240,380 480,520 720,450 C960,380 1200,520 1440,450 L1440,900 L0,900 Z"
          fill="url(#wave-grad)"
          opacity="0.4"
        />
        <path
          d="M0,500 C240,430 480,570 720,500 C960,430 1200,570 1440,500 L1440,900 L0,900 Z"
          fill="url(#wave-grad)"
          opacity="0.3"
        />
        <path
          d="M0,550 C240,480 480,620 720,550 C960,480 1200,620 1440,550 L1440,900 L0,900 Z"
          fill="url(#wave-grad)"
          opacity="0.2"
        />
        {Array.from({ length: 80 }).map((_, i) => {
          const x = (i * 17.3) % 1440;
          const y = 350 + ((i * 23.7) % 500);
          const r = 0.5 + ((i * 7) % 8) / 10;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={r}
              fill="var(--color-info)"
              opacity={0.3 + (i % 5) * 0.1}
            />
          );
        })}
      </svg>
    </div>
  );
}
