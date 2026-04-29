export class AgoraError extends Error {
  static readonly code: string = 'AGORA_ERROR';

  readonly code: string;
  override readonly cause?: unknown;

  constructor(message: string, options: { code?: string; cause?: unknown } = {}) {
    super(message);
    this.name = new.target.name;
    this.code = options.code ?? AgoraError.code;
    this.cause = options.cause;
  }
}

export class ChainNotSupportedError extends AgoraError {
  static override readonly code: string = 'CHAIN_NOT_SUPPORTED';

  constructor(message = 'Chain is not supported', cause?: unknown) {
    super(message, { code: ChainNotSupportedError.code, cause });
  }
}

export class InsufficientBalanceError extends AgoraError {
  static override readonly code: string = 'INSUFFICIENT_BALANCE';

  constructor(message = 'Insufficient balance', cause?: unknown) {
    super(message, { code: InsufficientBalanceError.code, cause });
  }
}

export class EscrowStateError extends AgoraError {
  static override readonly code: string = 'ESCROW_STATE_ERROR';

  constructor(message = 'Invalid escrow state transition', cause?: unknown) {
    super(message, { code: EscrowStateError.code, cause });
  }
}

export class WalletNotConnectedError extends AgoraError {
  static override readonly code: string = 'WALLET_NOT_CONNECTED';

  constructor(message = 'Wallet is not connected', cause?: unknown) {
    super(message, { code: WalletNotConnectedError.code, cause });
  }
}

export class RateLimitError extends AgoraError {
  static override readonly code: string = 'RATE_LIMITED';

  constructor(message = 'Rate limit exceeded', cause?: unknown) {
    super(message, { code: RateLimitError.code, cause });
  }
}

export class DailyCapExceededError extends AgoraError {
  static override readonly code: string = 'DAILY_CAP_EXCEEDED';

  constructor(message = 'Daily cap exceeded', cause?: unknown) {
    super(message, { code: DailyCapExceededError.code, cause });
  }
}
