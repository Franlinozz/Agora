import { NextRequest } from 'next/server';
import { proxyToVM } from '@/lib/api/proxy';
export const runtime = 'edge';
export async function POST(req: NextRequest, { params }: { params: { id: string } }) { return proxyToVM(req, `/agents/${encodeURIComponent(params.id)}/preview`); }
