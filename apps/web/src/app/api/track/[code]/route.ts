import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { code: string } }) {
  const booking = await prisma.booking.findUnique({
    where: { reference: params.code },
    select: { 
      id: true, 
      status: true, 
      pickupAddress: true, 
      dropoffAddress: true 
    },
  });

  if (!booking) {
    return new Response("Booking not found", { status: 404 });
  }

  return Response.json({
    id: booking.id,
    status: booking.status,
    pickupAddress: booking.pickupAddress,
    dropoffAddress: booking.dropoffAddress
  });
}


