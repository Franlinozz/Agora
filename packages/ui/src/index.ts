import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export * from './theme/tokens.ts';
export { WaveBackground } from './theme/wave-background.tsx';
export * from './primitives/index.ts';
export * from './patterns/index.ts';
export * from './components/index.ts';
