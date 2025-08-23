import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiHandler, requireRole, httpJson } from '@/lib/api/guard';
import { parseQueryParams } from '@/lib/validation/helpers';
import { paginationQuery, searchQuery } from '@/lib/validation/schemas';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, "customer");
  if (auth) return auth;

  const session = await getServerSession(authOptions);
  const customerId = (session?.user as any)?.id;

  const queryParams = parseQueryParams(request.url, paginationQuery.merge(searchQuery));
  if (!queryParams.ok) return queryParams.error;

  const { page, limit, status, search } = queryParams.data;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = { customerId };
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { reference: { contains: search, mode: 'insensitive' } },
      { customerName: { contains: search, mode: 'insensitive' } },
      { customerEmail: { contains: search, mode: 'insensitive' } }
    ];
  }

  // Get bookings with pagination
  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      select: {
        id: true,
        reference: true,
        status: true,
        scheduledAt: true,
        totalGBP: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        createdAt: true,
        pickupAddress: true,
        dropoffAddress: true,
        driver: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.booking.count({ where })
  ]);

  return httpJson(200, {
    bookings,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});
