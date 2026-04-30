import { NextRequest } from 'next/server';
import { proxyToVM } from '@/lib/api/proxy';
export const runtime = 'nodejs';
export async function GET(req: NextRequest) { return proxyToVM(req, '/events', { stream: true }); }
