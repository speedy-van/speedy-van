import { z } from 'zod';
// import { prisma } from '@/server/db';

const Input = z.object({ bookingId: z.string() });

export async function toolBookingStatus(input: unknown) {
  const { bookingId } = Input.parse(input);
  // const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  const booking = { id: bookingId, status: 'confirmed', etaMinutes: 35 }; // placeholder
  return { ok: true, data: booking };
}

