import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ ok: true, service: 'web', t: Date.now() });
}

export async function HEAD() {
  return new Response(null, { status: 200 });
}
