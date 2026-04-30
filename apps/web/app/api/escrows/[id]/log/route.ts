import { NextRequest } from 'next/server';
import { proxyToVM } from '@/lib/api/proxy';
export const runtime = 'nodejs';
export async function GET(req: NextRequest, { params }: { params: { id: string } }) { return proxyToVM(req, `/escrows/${encodeURIComponent(params.id)}/log`, { stream: true }); }
