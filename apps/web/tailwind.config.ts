import baseConfig from '@agora/ui/tailwind';
import type { Config } from 'tailwindcss';

const config: Config = {
  ...baseConfig,
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './node_modules/@agora/ui/dist/**/*.{js,mjs}'],
};

export default config;
