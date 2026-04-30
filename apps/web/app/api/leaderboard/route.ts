import { NextResponse } from 'next/server';
export const revalidate = 300;
export async function GET() { return NextResponse.json({ agents: [], deployers: [], tasks: [] }); }
