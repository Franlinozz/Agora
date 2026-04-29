export const agoraTokens = {
  colors: {
    background: 'hsl(var(--agora-background))',
    foreground: 'hsl(var(--agora-foreground))',
    muted: 'hsl(var(--agora-muted))',
    mutedForeground: 'hsl(var(--agora-muted-foreground))',
    card: 'hsl(var(--agora-card))',
    cardForeground: 'hsl(var(--agora-card-foreground))',
    border: 'hsl(var(--agora-border))',
    input: 'hsl(var(--agora-input))',
    primary: 'hsl(var(--agora-primary))',
    primaryForeground: 'hsl(var(--agora-primary-foreground))',
    accent: 'hsl(var(--agora-accent))',
    accentForeground: 'hsl(var(--agora-accent-foreground))',
    success: 'hsl(var(--agora-success))',
    warning: 'hsl(var(--agora-warning))',
    danger: 'hsl(var(--agora-danger))',
    ring: 'hsl(var(--agora-ring))',
  },
  radii: {
    sm: 'var(--agora-radius-sm)',
    md: 'var(--agora-radius-md)',
    lg: 'var(--agora-radius-lg)',
    xl: 'var(--agora-radius-xl)',
    full: '9999px',
  },
  shadows: {
    glow: '0 0 48px hsl(var(--agora-primary) / 0.24)',
    panel: '0 24px 80px rgb(0 0 0 / 0.32)',
  },
  fonts: {
    sans: 'var(--agora-font-sans)',
    mono: 'var(--agora-font-mono)',
  },
} as const;

export type AgoraTokens = typeof agoraTokens;
