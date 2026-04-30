import { NextRequest } from 'next/server';
export const runtime = 'nodejs';
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({ start(controller) { controller.enqueue(encoder.encode(`data: ${JSON.stringify({ id: `log-${Date.now()}`, timestamp: new Date().toISOString(), message: `Mediator stream connected for escrow #${params.id}.`, status: 'info' })}\n\n`)); controller.close(); } });
  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform' } });
}
