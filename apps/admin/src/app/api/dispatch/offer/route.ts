import { NextResponse } from 'next/server';
import { getPusherServer } from '@/lib/pusher';
import { notifyJobOffer } from '@/lib/notifications';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const {
    bookingId,
    driverId,
    ttlSeconds = 90,
    round = 1,
    score = 0,
  } = await req.json();
  if (!bookingId || !driverId)
    return NextResponse.json({ error: 'missing parameters' }, { status: 400 });

  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

  try {
    const result = await prisma.$transaction(async tx => {
      // Lock booking row by attempting update with conditional status
      const booking = await tx.booking.update({
        where: { id: bookingId },
        data: {},
      });
      if (booking.status !== 'CONFIRMED') {
        throw new Error('invalid_status');
      }
      if (booking.driverId) throw new Error('already_assigned');

      // Create single active offer (unique bookingId enforced by model)
      const assignment = await tx.assignment.create({
        data: {
          id: `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          bookingId,
          driverId,
          status: 'invited',
          round,
          score,
          expiresAt,
          updatedAt: new Date(),
        },
      });

      // Mark booking as offered/pending (we'll keep it as CONFIRMED since there's no 'offered' status)
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CONFIRMED' },
      });

      return assignment;
    });

    // Get booking details for notification
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        totalGBP: true,
        pickupAddress: true,
        dropoffAddress: true,
      },
    });

    // Create notification for driver
    if (booking) {
      await notifyJobOffer(driverId, {
        id: booking.id,
        estimatedPayout: booking.totalGBP,
        pickupAddress: booking.pickupAddress,
        dropoffAddress: booking.dropoffAddress,
      });
    }

    // Notify driver channel (legacy support)
    await getPusherServer().trigger(`driver-${driverId}`, 'job-offer', {
      bookingId,
      expiresAt,
    });
    return NextResponse.json({ ok: true, assignmentId: result.id, expiresAt });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 409 });
  }
}
