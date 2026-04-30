import { NextRequest } from 'next/server';
import { proxyToVM } from '@/lib/api/proxy';
export const runtime = 'edge';
export async function GET(req: NextRequest) { return proxyToVM(req, '/agents'); }
