import type { Config } from 'tailwindcss';

import { agoraTokens } from './src/theme/tokens.ts';

const config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: agoraTokens.colors,
      borderRadius: agoraTokens.radii,
      boxShadow: agoraTokens.shadows,
      fontFamily: {
        sans: [agoraTokens.fonts.sans],
        mono: [agoraTokens.fonts.mono],
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
