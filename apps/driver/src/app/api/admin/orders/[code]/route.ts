import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { code: string } }
) {
  const s = await getServerSession(authOptions);
  if (!s?.user || (s.user as any).role !== 'admin')
    return new Response('Unauthorized', { status: 401 });

  const booking = await prisma.booking.findUnique({
    where: { reference: params.code },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      driver: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      pickupAddress: true,
      dropoffAddress: true,
      pickupProperty: true,
      dropoffProperty: true,
      items: true,
      Assignment: {
        include: {
          Driver: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          JobEvent: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      },
      chatSessions: {
        include: {
          messages: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 50,
          },
        },
      },
      TrackingPing: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 100,
      },
    },
  });

  if (!booking) return new Response('Not Found', { status: 404 });

  await logAudit({
    action: 'read_order',
    targetType: 'booking',
    targetId: booking.id,
    before: null,
    after: { reference: booking.reference },
  });

  return Response.json(booking);
}

export async function PUT(
  req: Request,
  { params }: { params: { code: string } }
) {
  const s = await getServerSession(authOptions);
  if (!s?.user || (s.user as any).role !== 'admin')
    return new Response('Unauthorized', { status: 401 });

  const body = await req.json();
  const { status, driverId, scheduledAt, notes, reason } = body;

  const booking = await prisma.booking.findUnique({
    where: { reference: params.code },
    include: {
      driver: true,
      Assignment: true,
    },
  });

  if (!booking) return new Response('Not Found', { status: 404 });

  const before = {
    status: booking.status,
    driverId: booking.driverId,
    scheduledAt: booking.scheduledAt,
  };

  const updateData: any = {};
  if (status) updateData.status = status;
  if (driverId !== undefined) updateData.driverId = driverId;
  if (scheduledAt) updateData.scheduledAt = new Date(scheduledAt);

  const updatedBooking = await prisma.booking.update({
    where: { reference: params.code },
    data: updateData,
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      driver: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  // Log the audit
  await logAudit({
    action: 'update_order',
    targetType: 'booking',
    targetId: booking.id,
    before,
    after: updateData,
  });

  return Response.json(updatedBooking);
}
