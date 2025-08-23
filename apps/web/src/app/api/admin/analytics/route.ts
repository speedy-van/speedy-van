import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { subDays, startOfDay, format, parseISO } from "date-fns";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const s = await getServerSession(authOptions);
  if (!s?.user || (s.user as any).role !== "admin") {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range') || '30d';
  
  // Calculate date ranges
  const now = new Date();
  const days = range === '24h' ? 1 : range === '7d' ? 7 : 30;
  const since = subDays(now, days);
  const since7d = subDays(now, 7);
  const since24h = subDays(now, 1);

  try {
    // Parallel queries for performance
    const [
      // Basic booking counts and revenue
      bookingCounts,
      revenue30d,
      revenue7d,
      revenue24h,
      recentBookings,
      
      // Driver metrics
      driverMetrics,
      activeDrivers,
      
      // Cancellation analysis
      cancellationReasons,
      
      // Service area performance
      serviceAreas,
      
      // Real-time metrics
      jobsInProgress,
      latePickups,
      lateDeliveries,
      pendingAssignments,
      
      // Performance metrics
      onTimeMetrics,
      responseTimeMetrics,
      incidents
    ] = await Promise.all([
      // Basic metrics
      prisma.booking.groupBy({ 
        by: ['status'], 
        _count: { _all: true },
        where: { createdAt: { gte: since } }
      }),
      
      prisma.booking.aggregate({ 
        _sum: { totalGBP: true }, 
        _avg: { totalGBP: true },
        where: { 
          status: 'COMPLETED', 
          createdAt: { gte: since } 
        } 
      }),
      
      prisma.booking.aggregate({ 
        _sum: { totalGBP: true }, 
        _avg: { totalGBP: true },
        where: { 
          status: 'COMPLETED', 
          createdAt: { gte: since7d } 
        } 
      }),
      
      prisma.booking.aggregate({ 
        _sum: { totalGBP: true }, 
        _avg: { totalGBP: true },
        where: { 
          status: 'COMPLETED', 
          createdAt: { gte: since24h } 
        } 
      }),
      
      prisma.booking.findMany({ 
        where: { createdAt: { gte: since } }, 
        orderBy: { createdAt: 'asc' }, 
        select: { 
          createdAt: true, 
          totalGBP: true, 
          status: true
        } 
      }),

      // Driver performance metrics - fixed to use correct relationships
      prisma.driver.findMany({
        where: { 
          status: 'active',
          Booking: {
            some: {
              createdAt: { gte: since }
            }
          }
        },
        select: {
          id: true,
          user: {
            select: {
              name: true
            }
          },
          Booking: {
            where: {
              status: 'COMPLETED',
              createdAt: { gte: since }
            },
            select: {
              id: true,
              totalGBP: true
            }
          },
          ratings: {
            where: {
              createdAt: { gte: since }
            },
            select: {
              rating: true
            }
          },
          Assignment: {
            where: {
              createdAt: { gte: since }
            },
            select: {
              status: true,
              claimedAt: true
            }
          }
        }
      }),

      prisma.driverAvailability.count({
        where: { status: 'online' }
      }),

      // Cancellation reasons (mock data for now - would need to be implemented)
      Promise.resolve([
        { reason: 'Customer cancelled', count: 15, percentage: 30 },
        { reason: 'Driver unavailable', count: 10, percentage: 20 },
        { reason: 'Weather conditions', count: 8, percentage: 16 },
        { reason: 'Vehicle breakdown', count: 6, percentage: 12 },
        { reason: 'Traffic delays', count: 5, percentage: 10 },
        { reason: 'Other', count: 6, percentage: 12 }
      ]),

      // Service area performance (mock data for now)
      Promise.resolve([]),

      // Real-time metrics
      prisma.booking.count({
        where: { 
          status: { in: ['CONFIRMED'] },
          createdAt: { gte: since24h }
        }
      }),

      prisma.booking.count({
        where: { 
          status: 'CONFIRMED',
          createdAt: { gte: since24h }
        }
      }),

      prisma.booking.count({
        where: { 
          status: 'CONFIRMED',
          createdAt: { gte: since24h }
        }
      }),

      prisma.booking.count({
        where: { 
          status: 'DRAFT',
          createdAt: { gte: since24h }
        }
      }),

      // On-time performance (mock data for now)
      Promise.resolve({ pickup: 92, delivery: 89 }),

      // Response time (mock data for now)
      Promise.resolve(15),

      // Open incidents (mock data for now)
      Promise.resolve(3)
    ]);

    // Process time series data - fixed variable name
    const map = new Map<string, { day: string; revenue: number; bookings: number; completed: number; cancelled: number }>();
    for (let i = 0; i < days; i++) {
      const d = format(startOfDay(subDays(now, i)), 'yyyy-MM-dd');
      map.set(d, { day: d, revenue: 0, bookings: 0, completed: 0, cancelled: 0 });
    }

    for (const booking of recentBookings) {
      const d = format(startOfDay(booking.createdAt), 'yyyy-MM-dd');
      const row = map.get(d);
      if (row) {
        row.bookings += 1;
        if (booking.status === 'COMPLETED') {
          row.revenue += (booking.totalGBP || 0);
        }
        if (booking.status === 'COMPLETED') {
          row.completed += 1;
        } else if (booking.status === 'CANCELLED') {
          row.cancelled += 1;
        }
      }
    }

    // Process driver metrics - fixed to use correct field names
    const processedDriverMetrics = driverMetrics.map(driver => {
      const completedJobs = driver.Booking.length;
      const totalEarnings = driver.Booking.reduce((sum, b) => sum + (b.totalGBP || 0), 0);
      const avgRating = driver.ratings.length > 0 
        ? driver.ratings.reduce((sum, r) => sum + r.rating, 0) / driver.ratings.length 
        : 0;
      
      // Calculate on-time rate (mock calculation)
      const onTimeRate = Math.floor(Math.random() * 20) + 80; // 80-100%

      return {
        driverId: driver.id,
        driverName: driver.user.name || 'Unknown Driver',
        completedJobs,
        avgRating,
        earnings: totalEarnings,
        onTimeRate
      };
    }).sort((a, b) => b.earnings - a.earnings);

    // Process service areas
    const processedServiceAreas = serviceAreas.map(area => ({
      area: 'Unknown Area',
      bookings: 0,
      revenue: 0,
      avgRating: Math.floor(Math.random() * 2) + 4 // 4-5 stars
    })).sort((a, b) => b.revenue - a.revenue);

    const payload = {
      kpis: {
        totalRevenue30d: (revenue30d._sum.totalGBP ?? 0),
        totalRevenue7d: (revenue7d._sum.totalGBP ?? 0),
        totalRevenue24h: (revenue24h._sum.totalGBP ?? 0),
        aov30d: (revenue30d._avg.totalGBP ?? 0),
        aov7d: (revenue7d._avg.totalGBP ?? 0),
        conversionRate: 15.5, // Mock conversion rate
        onTimePickup: onTimeMetrics.pickup,
        onTimeDelivery: onTimeMetrics.delivery,
        avgResponseTime: responseTimeMetrics,
        openIncidents: incidents,
        activeDrivers: activeDrivers,
        totalBookings: bookingCounts.reduce((sum, c) => sum + c._count._all, 0),
        completedBookings: bookingCounts.find(c => c.status === 'COMPLETED')?._count._all || 0,
        cancelledBookings: bookingCounts.find(c => c.status === 'CANCELLED')?._count._all || 0,
        byStatus: bookingCounts.reduce((acc, c) => ({ ...acc, [c.status]: c._count._all }), {}),
      },
      series: Array.from(map.values()).sort((a, b) => a.day.localeCompare(b.day)),
      driverMetrics: processedDriverMetrics,
      cancellationReasons,
      serviceAreas: processedServiceAreas,
      realTimeMetrics: {
        jobsInProgress,
        latePickups,
        lateDeliveries,
        pendingAssignments
      }
    };

    await logAudit({ 
      action: "read_analytics", 
      targetType: "analytics", 
      before: null, 
      after: { range, days } 
    });

    return Response.json(payload);
  } catch (error) {
    console.error('Analytics API error:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
}


