import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'driver')
    return new Response('Unauthorized', { status: 401 });
  const userId = (session.user as any).id;
  const driver = await prisma.driver.findUnique({ where: { userId } });
  if (!driver) return new Response('Driver not found', { status: 404 });

  const { bookingId } = await req.json();
  if (!bookingId)
    return NextResponse.json({ error: 'bookingId required' }, { status: 400 });

  try {
    await prisma.$transaction(async tx => {
      const offer = await tx.assignment.findUnique({ where: { bookingId } });
      if (!offer || offer.driverId !== driver.id || offer.status !== 'invited')
        throw new Error('offer_invalid');
      await tx.assignment.update({
        where: { bookingId },
        data: { status: 'declined' },
      });
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CONFIRMED' },
      });
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 409 });
  }
}
