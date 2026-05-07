import { NextResponse } from 'next/server';

export const runtime = 'edge';

type CoinbaseSpotResponse = {
  data?: {
    amount?: string;
    currency?: string;
  };
};

export async function GET() {
  try {
    const response = await fetch('https://api.coinbase.com/v2/prices/ETH-USD/spot', {
      headers: { accept: 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'ETH price provider unavailable' }, { status: 502 });
    }

    const body = (await response.json()) as CoinbaseSpotResponse;
    const amount = body.data?.amount;
    if (!amount || Number.isNaN(Number(amount))) {
      return NextResponse.json({ error: 'ETH price provider returned an invalid response' }, { status: 502 });
    }

    return NextResponse.json({
      pair: 'ETH-USD',
      amount,
      currency: body.data?.currency ?? 'USD',
      source: 'coinbase',
      observedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'ETH price lookup failed' }, { status: 502 });
  }
}
