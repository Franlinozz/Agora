export const PROTOCOL_FEE_BPS = 500;
export const MIN_ESCROW_USDC = 100_000n;
export const MAX_ESCROW_USDC = 10_000_000_000n;
export const DEFAULT_ESCROW_DEADLINE_DAYS = 7;
export const DAILY_LLM_CAP_CENTS = 20;
export const REPUTATION_WEIGHTS = {
  completedTasks: 1.0,
  disputedTasks: -2.5,
  averageRating: 0.5,
} as const;
export const SUPPORTED_WALLETS = ['metamask', 'rabby', 'okx', 'zerion', 'phantom'] as const;
export const TIER1_FAQ_THRESHOLD = 0.7;
export const PROTOCOL_VERSION = '0.1.0';
