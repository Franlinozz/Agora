import { NextRequest, NextResponse } from 'next/server';

const VM_URL = process.env.API_GATEWAY_URL || 'http://localhost:4000';
const VM_SECRET = process.env.API_GATEWAY_SECRET || '';

export async function proxyToVM(req: NextRequest, path: string, opts?: { stream?: boolean }) {
  const url = `${VM_URL.replace(/\/$/, '')}${path}${req.nextUrl.search}`;
  const headers: Record<string, string> = {
    'X-Forwarded-For': req.headers.get('x-forwarded-for') || 'unknown',
    'X-Gateway-Secret': VM_SECRET,
  };
  const contentType = req.headers.get('content-type');
  if (contentType) headers['Content-Type'] = contentType;
  const body = ['GET', 'HEAD'].includes(req.method) ? undefined : await req.text();
  try {
    const res = await fetch(url, { method: req.method, headers, body: body || undefined } as RequestInit);
    if (opts?.stream) return new NextResponse(res.body, { status: res.status, headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform' } });
    const text = await res.text();
    try { return NextResponse.json(text ? JSON.parse(text) : {}, { status: res.status }); } catch { return new NextResponse(text, { status: res.status }); }
  } catch (err) {
    console.error('Proxy error', err);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}
