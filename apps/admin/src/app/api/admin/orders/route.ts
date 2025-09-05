import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const s = await getServerSession(authOptions);
  if (!s?.user || (s.user as any).role !== 'admin') {
    return new Response('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  const status = searchParams.get('status') as any;
  const driver = searchParams.get('driver');
  const area = searchParams.get('area');
  const dateRange = searchParams.get('dateRange');
  const take = parseInt(searchParams.get('take') || '50');
  const cursor = searchParams.get('cursor');

  // Build date filter
  let dateFilter = {};
  if (dateRange) {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        const todayStart = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        dateFilter = {
          createdAt: {
            gte: todayStart,
          },
        };
        break;
      case 'week':
        const weekStart = new Date(
          now.getTime() - now.getDay() * 24 * 60 * 60 * 1000
        );
        dateFilter = {
          createdAt: {
            gte: weekStart,
          },
        };
        break;
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = {
          createdAt: {
            gte: monthStart,
          },
        };
        break;
    }
  }

  const orders = await prisma.booking.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(driver
        ? {
            driver: {
              user: {
                name: { contains: driver, mode: 'insensitive' },
              },
            },
          }
        : {}),
      ...(area
        ? {
            OR: [
              {
                pickupAddress: {
                  label: { contains: area, mode: 'insensitive' },
                },
              },
              {
                dropoffAddress: {
                  label: { contains: area, mode: 'insensitive' },
                },
              },
            ],
          }
        : {}),
      ...(q
        ? {
            OR: [
              { reference: { contains: q, mode: 'insensitive' } },
              {
                pickupAddress: { label: { contains: q, mode: 'insensitive' } },
              },
              {
                dropoffAddress: { label: { contains: q, mode: 'insensitive' } },
              },
              { customerName: { contains: q, mode: 'insensitive' } },
              { customerEmail: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...dateFilter,
    },
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
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: take,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });

  await logAudit({
    action: 'read_orders',
    targetType: 'booking',
    before: null,
    after: { count: orders.length, q, status, driver, area, dateRange },
  });

  const nextCursor =
    orders.length === take ? orders[orders.length - 1].id : null;
  return Response.json({ items: orders, nextCursor });
}
