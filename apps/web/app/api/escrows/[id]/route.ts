import { NextRequest, NextResponse } from 'next/server';
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) { return NextResponse.json({ id: params.id, escrow: null }); }
