import { NextResponse } from 'next/server';

export const revalidate = 60;

export async function GET() {
  return NextResponse.json({
    totalAgents: 0,
    totalEscrows: 0,
    totalSettledUsdc: '0',
    activeAgentsWeek: 0,
  });
}
