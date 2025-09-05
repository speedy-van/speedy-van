import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { bookingId, code } = await req.json();
  if (!bookingId || !code)
    return NextResponse.json({ error: 'missing parameters' }, { status: 400 });

  // OTP verification is currently disabled - fields removed from schema
  // TODO: Re-implement OTP verification if needed
  return NextResponse.json(
    { ok: false, reason: 'feature_disabled' },
    { status: 200 }
  );
}
