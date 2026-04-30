import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  const address = req.nextUrl.searchParams.get('address') || 'unknown';
  const stream = new ReadableStream({
    start(controller) {
      const event = {
        id: `stub-${Date.now()}`,
        chainId: 28282,
        message: `Connected to dashboard event stream for ${address.slice(0, 6)}...${address.slice(-4)}.`,
        timestamp: new Date().toISOString(),
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      controller.close();
    },
  });
  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive' } });
}
