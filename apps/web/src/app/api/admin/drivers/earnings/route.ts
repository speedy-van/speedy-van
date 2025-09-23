import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'today'; // today, week, month
    const driverId = searchParams.get('driverId'); // Optional: filter by specific driver

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        startDate = startOfWeek;
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    // Build where clause
    const whereClause: any = {
      calculatedAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (driverId) {
      whereClause.driverId = driverId;
    }

    // Get driver earnings with driver and assignment details
    const earnings = await prisma.driverEarnings.findMany({
      where: whereClause,
      include: {
        Assignment: {
          include: {
            Booking: {
              select: {
                id: true,
                reference: true,
                customerName: true,
                totalGBP: true,
                scheduledAt: true,
              },
            },
          },
        },
        driver: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        calculatedAt: 'desc',
      },
    });

    // Calculate summary statistics
    const totalEarnings = earnings.reduce((sum, earning) => sum + earning.netAmountPence, 0);
    const totalJobs = earnings.length;
    const totalPlatformFees = earnings.reduce((sum, earning) => sum + earning.feeAmountPence, 0);

    // Group by driver for driver-specific stats
    const driverStats = earnings.reduce((acc, earning) => {
      const driverId = earning.driverId;
      const driverName = earning.driver.user.name || 'Unknown Driver';
      
      if (!acc[driverId]) {
        acc[driverId] = {
          driverId,
          driverName,
          driverEmail: earning.driver.user.email,
          totalEarnings: 0,
          totalJobs: 0,
          jobs: [],
        };
      }
      
      acc[driverId].totalEarnings += earning.netAmountPence;
      acc[driverId].totalJobs += 1;
      acc[driverId].jobs.push({
        assignmentId: earning.assignmentId,
        bookingReference: earning.Assignment.Booking.reference,
        customerName: earning.Assignment.Booking.customerName,
        earnings: earning.netAmountPence,
        calculatedAt: earning.calculatedAt,
        paidOut: earning.paidOut,
      });
      
      return acc;
    }, {} as Record<string, any>);

    // Convert pence to pounds for display
    const formatCurrency = (pence: number) => (pence / 100).toFixed(2);

    const response = {
      success: true,
      data: {
        period,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        summary: {
          totalEarnings: formatCurrency(totalEarnings),
          totalJobs,
          totalPlatformFees: formatCurrency(totalPlatformFees),
          averageEarningsPerJob: totalJobs > 0 ? formatCurrency(totalEarnings / totalJobs) : '0.00',
        },
        driverStats: Object.values(driverStats).map((driver: any) => ({
          ...driver,
          totalEarnings: formatCurrency(driver.totalEarnings),
          jobs: driver.jobs.map((job: any) => ({
            ...job,
            earnings: formatCurrency(job.earnings),
          })),
        })),
        rawEarnings: earnings.map(earning => ({
          id: earning.id,
          driverId: earning.driverId,
          driverName: earning.driver.user.name,
          assignmentId: earning.assignmentId,
          bookingReference: earning.Assignment.Booking.reference,
          customerName: earning.Assignment.Booking.customerName,
          baseAmount: formatCurrency(earning.baseAmountPence),
          surgeAmount: formatCurrency(earning.surgeAmountPence),
          tipAmount: formatCurrency(earning.tipAmountPence),
          feeAmount: formatCurrency(earning.feeAmountPence),
          netAmount: formatCurrency(earning.netAmountPence),
          currency: earning.currency,
          calculatedAt: earning.calculatedAt,
          paidOut: earning.paidOut,
        })),
      },
    };

    console.log(`📊 Admin earnings report generated for ${period}:`, {
      totalEarnings: response.data.summary.totalEarnings,
      totalJobs: response.data.summary.totalJobs,
      driversCount: Object.keys(driverStats).length,
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error fetching driver earnings:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch driver earnings',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
