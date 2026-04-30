import { logger } from './logger.ts';

const BASE_DELAY_MS = 30_000;
const MAX_DELAY_MS = 300_000;

export async function withRpcBackoff<T>(label: string, operation: () => Promise<T>): Promise<T> {
  let delayMs = BASE_DELAY_MS;

  for (;;) {
    try {
      return await operation();
    } catch (error) {
      if (!isRateLimitError(error)) throw error;

      logger.warn({ label, delayMs, error }, 'RPC rate limited; backing off');
      await sleep(delayMs);
      delayMs = Math.min(delayMs * 2, MAX_DELAY_MS);
    }
  }
}

function isRateLimitError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('429') || message.toLowerCase().includes('rate limit');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
