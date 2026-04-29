import type { SVGProps } from 'react';

export interface WaveBackgroundProps extends SVGProps<SVGSVGElement> {
  intensity?: 'subtle' | 'medium';
}

export function WaveBackground({ intensity = 'subtle', ...props }: WaveBackgroundProps) {
  const opacity = intensity === 'medium' ? 0.22 : 0.12;

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 720"
      preserveAspectRatio="none"
      {...props}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity,
        ...(props.style ?? {}),
      }}
    >
      <defs>
        <linearGradient id="agora-wave" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--agora-primary))" />
          <stop offset="55%" stopColor="hsl(var(--agora-accent))" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path
        d="M-80 446C156 326 311 598 548 456c179-107 282-288 491-183 145 73 263 66 481-42"
        fill="none"
        stroke="url(#agora-wave)"
        strokeWidth="2"
      />
      <path
        d="M-93 532c265-154 458 133 702-37 171-119 244-248 444-166 172 70 276 117 474-38"
        fill="none"
        stroke="url(#agora-wave)"
        strokeWidth="1"
      />
      <path
        d="M-78 619c260-111 415 83 654-31 239-113 278-255 512-153 160 69 259 83 441-33"
        fill="none"
        stroke="url(#agora-wave)"
        strokeWidth="1"
      />
    </svg>
  );
}
