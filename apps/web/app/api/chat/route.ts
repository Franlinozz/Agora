import { NextResponse } from 'next/server';
export async function POST() { return NextResponse.json({ tier: 'fallback', message: "I'm taking a break for the day. Try the docs or our Discord!", discordUrl: 'https://discord.gg/agora' }); }
