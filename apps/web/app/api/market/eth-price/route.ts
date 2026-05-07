import { NextResponse } from 'next/server';

export const runtime = 'edge';

type PriceResult = {
  amount: string;
  currency: string;
  source: string;
};

type CoinbaseSpotResponse = {
  data?: {
    amount?: string;
    currency?: string;
  };
};

type CoinGeckoSimpleResponse = {
  ethereum?: {
    usd?: number;
  };
};

type BinanceTickerResponse = {
  price?: string;
};

export async function GET() {
  const result = await firstSuccessfulPrice([
    getCoinbasePrice,
    getCoinGeckoPrice,
    getBinancePrice,
  ]);

  if (!result) {
    return NextResponse.json({ error: 'ETH price lookup failed across providers' }, { status: 502 });
  }

  return NextResponse.json({
    pair: 'ETH-USD',
    amount: result.amount,
    currency: result.currency,
    source: result.source,
    observedAt: new Date().toISOString(),
  });
}

async function firstSuccessfulPrice(providers: Array<() => Promise<PriceResult | null>>): Promise<PriceResult | null> {
  for (const provider of providers) {
    const result = await provider().catch(() => null);
    if (result && isValidAmount(result.amount)) return result;
  }

  return null;
}

async function getCoinbasePrice(): Promise<PriceResult | null> {
  const response = await fetch('https://api.coinbase.com/v2/prices/ETH-USD/spot', {
    headers: {
      accept: 'application/json',
      'user-agent': 'AgoraAgentAI/1.0 price-check',
    },
    cache: 'no-store',
  });
  if (!response.ok) return null;

  const body = (await response.json()) as CoinbaseSpotResponse;
  const amount = body.data?.amount;
  if (!amount || !isValidAmount(amount)) return null;

  return { amount, currency: body.data?.currency ?? 'USD', source: 'coinbase' };
}

async function getCoinGeckoPrice(): Promise<PriceResult | null> {
  const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd', {
    headers: {
      accept: 'application/json',
      'user-agent': 'AgoraAgentAI/1.0 price-check',
    },
    cache: 'no-store',
  });
  if (!response.ok) return null;

  const body = (await response.json()) as CoinGeckoSimpleResponse;
  const amount = body.ethereum?.usd;
  if (amount === undefined || !Number.isFinite(amount)) return null;

  return { amount: amount.toString(), currency: 'USD', source: 'coingecko' };
}

async function getBinancePrice(): Promise<PriceResult | null> {
  const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT', {
    headers: {
      accept: 'application/json',
      'user-agent': 'AgoraAgentAI/1.0 price-check',
    },
    cache: 'no-store',
  });
  if (!response.ok) return null;

  const body = (await response.json()) as BinanceTickerResponse;
  const amount = body.price;
  if (!amount || !isValidAmount(amount)) return null;

  return { amount, currency: 'USD', source: 'binance' };
}

function isValidAmount(amount: string): boolean {
  const parsed = Number(amount);
  return Number.isFinite(parsed) && parsed > 0;
}
