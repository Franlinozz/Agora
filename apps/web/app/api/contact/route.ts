import { NextRequest } from 'next/server';
import { proxyToVM } from '@/lib/api/proxy';
export const runtime = 'edge';
export async function POST(req: NextRequest) { return proxyToVM(req, '/contact'); }
