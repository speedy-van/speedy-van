import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { subDays, startOfDay, format } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const s = await getServerSession(authOptions);
    if (!s?.user || (s.user as any).role !== 'admin') {
      return new Response('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    // Calculate date ranges
    const now = new Date();
    const days = range === '24h' ? 1 : range === '7d' ? 7 : 30;
    const since = subDays(now, days);
    const since7d = subDays(now, 7);
    const since24h = subDays(now, 1);

    // Start with basic queries to test database connection
    const [bookingCounts, revenue30d, revenue7d, revenue24h, recentBookings] =
      await Promise.all([
        prisma.booking.groupBy({
          by: ['status'],
          _count: { _all: true },
          where: { createdAt: { gte: since } },
        }),

        prisma.booking.aggregate({
          _sum: { totalGBP: true },
          _avg: { totalGBP: true },
          where: {
            status: 'COMPLETED',
            createdAt: { gte: since },
          },
        }),

        prisma.booking.aggregate({
          _sum: { totalGBP: true },
          _avg: { totalGBP: true },
          where: {
            status: 'COMPLETED',
            createdAt: { gte: since7d },
          },
        }),

        prisma.booking.aggregate({
          _sum: { totalGBP: true },
          _avg: { totalGBP: true },
          where: {
            status: 'COMPLETED',
            createdAt: { gte: since24h },
          },
        }),

        prisma.booking.findMany({
          where: { createdAt: { gte: since } },
          orderBy: { createdAt: 'asc' },
          select: {
            createdAt: true,
            totalGBP: true,
            status: true,
          },
        }),
      ]);

    // Process time series data
    const map = new Map<
      string,
      {
        day: string;
        revenue: number;
        bookings: number;
        completed: number;
        cancelled: number;
      }
    >();
    for (let i = 0; i < days; i++) {
      const d = format(startOfDay(subDays(now, i)), 'yyyy-MM-dd');
      map.set(d, {
        day: d,
        revenue: 0,
        bookings: 0,
        completed: 0,
        cancelled: 0,
      });
    }

    for (const booking of recentBookings) {
      const d = format(startOfDay(booking.createdAt), 'yyyy-MM-dd');
      const row = map.get(d);
      if (row) {
        row.bookings += 1;
        if (booking.status === 'COMPLETED') {
          row.revenue += booking.totalGBP || 0;
          row.completed += 1;
        } else if (booking.status === 'CANCELLED') {
          row.cancelled += 1;
        }
      }
    }

    // Create complete payload with mock data for missing fields
    const payload = {
      kpis: {
        totalRevenue30d: revenue30d._sum.totalGBP ?? 0,
        totalRevenue7d: revenue7d._sum.totalGBP ?? 0,
        totalRevenue24h: revenue24h._sum.totalGBP ?? 0,
        aov30d: revenue30d._avg.totalGBP ?? 0,
        aov7d: revenue7d._avg.totalGBP ?? 0,
        conversionRate: 15.5, // Mock conversion rate
        onTimePickup: 92, // Mock on-time pickup rate
        onTimeDelivery: 89, // Mock on-time delivery rate
        avgResponseTime: 15, // Mock response time
        openIncidents: 3, // Mock open incidents
        activeDrivers: 12, // Mock active drivers
        totalBookings: bookingCounts.reduce((sum, c) => sum + c._count._all, 0),
        completedBookings:
          bookingCounts.find(c => c.status === 'COMPLETED')?._count._all || 0,
        cancelledBookings:
          bookingCounts.find(c => c.status === 'CANCELLED')?._count._all || 0,
        byStatus: bookingCounts.reduce(
          (acc, c) => ({ ...acc, [c.status]: c._count._all }),
          {}
        ),
      },
      series: Array.from(map.values()).sort((a, b) =>
        a.day.localeCompare(b.day)
      ),
      driverMetrics: [
        {
          driverId: '1',
          driverName: 'John Smith',
          completedJobs: 45,
          avgRating: 4.8,
          earnings: 1250,
          onTimeRate: 95,
        },
        {
          driverId: '2',
          driverName: 'Sarah Johnson',
          completedJobs: 38,
          avgRating: 4.7,
          earnings: 1100,
          onTimeRate: 92,
        },
        {
          driverId: '3',
          driverName: 'Mike Wilson',
          completedJobs: 42,
          avgRating: 4.6,
          earnings: 1180,
          onTimeRate: 88,
        },
        {
          driverId: '4',
          driverName: 'Emma Davis',
          completedJobs: 35,
          avgRating: 4.9,
          earnings: 980,
          onTimeRate: 96,
        },
        {
          driverId: '5',
          driverName: 'David Brown',
          completedJobs: 40,
          avgRating: 4.5,
          earnings: 1050,
          onTimeRate: 90,
        },
      ],
      cancellationReasons: [
        { reason: 'Customer cancelled', count: 15, percentage: 30 },
        { reason: 'Driver unavailable', count: 10, percentage: 20 },
        { reason: 'Weather conditions', count: 8, percentage: 16 },
        { reason: 'Vehicle breakdown', count: 6, percentage: 12 },
        { reason: 'Traffic delays', count: 5, percentage: 10 },
        { reason: 'Other', count: 6, percentage: 12 },
      ],
      serviceAreas: [
        { area: 'Central London', bookings: 45, revenue: 2250, avgRating: 4.8 },
        { area: 'North London', bookings: 32, revenue: 1600, avgRating: 4.6 },
        { area: 'South London', bookings: 28, revenue: 1400, avgRating: 4.7 },
        { area: 'East London', bookings: 25, revenue: 1250, avgRating: 4.5 },
        { area: 'West London', bookings: 30, revenue: 1500, avgRating: 4.9 },
      ],
      realTimeMetrics: {
        jobsInProgress: 8,
        latePickups: 2,
        lateDeliveries: 1,
        pendingAssignments: 3,
      },
    };

    await logAudit(s.user.id, 'read_analytics', undefined, { targetType: 'analytics', before: null, after: { range, days } });

    return Response.json(payload);
  } catch (error) {
    console.error('Analytics API error:', error);
    return new Response(
      `Internal Server Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { status: 500 }
    );
  }
}
