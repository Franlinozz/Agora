import type { Config } from 'tailwindcss';

const config: Config = {
  content: [],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: {
          0: 'var(--color-bg-0)',
          1: 'var(--color-bg-1)',
          2: 'var(--color-bg-2)',
          3: 'var(--color-bg-3)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          muted: 'var(--color-text-muted)',
        },
        arc: {
          DEFAULT: 'var(--color-arc-purple)',
          deep: 'var(--color-arc-purple-deep)',
          light: 'var(--color-arc-purple-light)',
        },
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
        info: 'var(--color-info)',
        live: 'var(--color-live)',
      },
      fontFamily: { sans: 'var(--font-sans)', mono: 'var(--font-mono)' },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      transitionTimingFunction: { agora: 'cubic-bezier(0.4, 0, 0.2, 1)' },
    },
  },
  plugins: [],
};

export default config;
