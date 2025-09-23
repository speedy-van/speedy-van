import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { penceToPounds } from '@/lib/utils/currency';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Helper function to calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Radius of the Earth in miles
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in miles
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

export async function GET(request: NextRequest) {
  try {
    // Check driver authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== 'driver') {
      return NextResponse.json(
        { error: 'Forbidden - Driver access required' },
        { status: 403 }
      );
    }

    const userId = session.user.id;

    // Get driver record
    const driver = await prisma.driver.findUnique({
      where: { userId },
      select: { id: true, status: true, onboardingStatus: true }
    });

    if (!driver) {
      return NextResponse.json(
        { error: 'Driver profile not found' },
        { status: 404 }
      );
    }

    if (driver.status !== 'active' || driver.onboardingStatus !== 'approved') {
      return NextResponse.json(
        { error: 'Driver account not active or not approved' },
        { status: 403 }
      );
    }

    // Get driver's assigned jobs
    const assignedJobs = await prisma.assignment.findMany({
      where: {
        driverId: driver.id,
        status: { in: ['invited', 'accepted'] }
      },
      include: {
        Booking: {
          include: {
            pickupAddress: true,
            dropoffAddress: true,
            items: true,
            customer: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get available jobs (unassigned bookings)
    const availableJobs = await prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        driverId: null, // Not assigned to any driver
        scheduledAt: {
          gte: new Date() // Future bookings only
        }
      },
      include: {
        pickupAddress: true,
        dropoffAddress: true,
        items: true,
        customer: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { scheduledAt: 'asc' },
      take: 10 // Limit to 10 available jobs
    });

    // Calculate driver statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      completedTodayCount,
      totalCompletedCount,
      totalEarnings,
      avgRating
    ] = await Promise.all([
      // Jobs completed today
      prisma.assignment.count({
        where: {
          driverId: driver.id,
          status: 'completed',
          updatedAt: { gte: today, lt: tomorrow }
        }
      }),
      
      // Total completed jobs
      prisma.assignment.count({
        where: {
          driverId: driver.id,
          status: 'completed'
        }
      }),
      
      // Total earnings
      prisma.driverEarnings.aggregate({
        where: { driverId: driver.id },
        _sum: { netAmountPence: true }
      }),
      
      // Average rating
      prisma.driverRating.aggregate({
        where: { driverId: driver.id },
        _avg: { rating: true }
      })
    ]);

    // Format assigned jobs for frontend
    const formattedAssignedJobs = assignedJobs.map(assignment => {
      // Calculate actual distance
      const distance = calculateDistance(
        assignment.Booking.pickupAddress?.lat || 0,
        assignment.Booking.pickupAddress?.lng || 0,
        assignment.Booking.dropoffAddress?.lat || 0,
        assignment.Booking.dropoffAddress?.lng || 0
      );

      return {
        id: assignment.Booking.id,
        assignmentId: assignment.id,
        customer: assignment.Booking.customer?.name || assignment.Booking.customerName,
        customerPhone: assignment.Booking.customerPhone,
        customerEmail: assignment.Booking.customerEmail,
        from: assignment.Booking.pickupAddress?.label || 'Pickup Address',
        to: assignment.Booking.dropoffAddress?.label || 'Dropoff Address',
        date: assignment.Booking.scheduledAt.toISOString().split('T')[0],
        time: assignment.Booking.scheduledAt.toLocaleTimeString('en-GB', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        distance: `${distance} miles`,
        estimatedEarnings: penceToPounds(Math.floor((assignment.Booking.totalGBP - Math.floor(assignment.Booking.totalGBP * 0.15)) * 0.85)), // Driver payout calculation
        vehicleType: assignment.Booking.crewSize === 'ONE' ? 'Van' : 'Large Van',
        items: assignment.Booking.items.map(item => item.name).join(', ') || 'No items specified',
        status: assignment.status,
        assignmentStatus: assignment.status,
        bookingStatus: assignment.Booking.status,
        reference: assignment.Booking.reference,
        createdAt: assignment.createdAt,
        expiresAt: assignment.expiresAt
      };
    });

    // Format available jobs for frontend
    const formattedAvailableJobs = availableJobs.map(booking => ({
      id: booking.id,
      customer: booking.customer?.name || booking.customerName,
      customerPhone: booking.customerPhone,
      customerEmail: booking.customerEmail,
      from: booking.pickupAddress?.label || 'Pickup Address',
      to: booking.dropoffAddress?.label || 'Dropoff Address',
      date: booking.scheduledAt.toISOString().split('T')[0],
      time: booking.scheduledAt.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      distance: `${booking.baseDistanceMiles || 0} miles`,
      estimatedEarnings: penceToPounds(Math.floor((booking.totalGBP - Math.floor(booking.totalGBP * 0.15)) * 0.85)), // Driver payout calculation
      vehicleType: booking.crewSize === 'ONE' ? 'Van' : 'Large Van',
      items: booking.items.map(item => item.name).join(', ') || 'No items specified',
      status: 'available',
      reference: booking.reference,
      createdAt: booking.createdAt,
      scheduledAt: booking.scheduledAt
    }));

    // Calculate statistics
    const stats = {
      assignedJobs: assignedJobs.length,
      availableJobs: availableJobs.length,
      completedToday: completedTodayCount,
      totalCompleted: totalCompletedCount,
      earningsToday: 0, // Would need to calculate from today's completed jobs
      totalEarnings: penceToPounds(totalEarnings._sum.netAmountPence || 0),
      averageRating: avgRating._avg.rating || 0,
    };

    console.log(`✅ Driver dashboard data loaded for driver ${driver.id}:`, {
      assignedJobs: stats.assignedJobs,
      availableJobs: stats.availableJobs,
      completedToday: stats.completedToday,
      totalEarnings: stats.totalEarnings
    });

    return NextResponse.json({
      success: true,
      data: {
        driver: {
          id: driver.id,
          status: driver.status,
          onboardingStatus: driver.onboardingStatus
        },
        jobs: {
          assigned: formattedAssignedJobs,
          available: formattedAvailableJobs
        },
        statistics: stats
      }
    });

  } catch (error) {
    console.error('❌ Error loading driver dashboard data:', error);
    return NextResponse.json(
      {
        error: 'Failed to load dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
