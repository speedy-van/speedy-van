import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  const { bookingId, channel, destination } = await req.json();
  if (!bookingId || !channel || !destination)
    return NextResponse.json({ error: 'missing parameters' }, { status: 400 });

  const code = generateCode();
  const now = new Date();
  const expiry = new Date(now.getTime() + 10 * 60 * 1000);

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      otpCode: code,
      otpChannel: channel,
      otpExpiresAt: expiry,
      otpLastSentAt: now,
      otpSendCount: { increment: 1 } as any,
    },
  } as any);

  // NOTE: Integrate SMS/Email providers later. For now, return masked destination.
  const masked = destination.replace(/.(?=.{2})/g, '*');
  return NextResponse.json({ sent: true, channel, destination: masked });
}
