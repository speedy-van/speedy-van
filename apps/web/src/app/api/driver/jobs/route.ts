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
    console.log('🚗 Driver Jobs API - Starting request');
    
    // Check driver authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log('❌ Driver Jobs API - No session found');
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== 'driver') {
      console.log('❌ Driver Jobs API - Invalid role:', userRole);
      return NextResponse.json(
        { error: 'Forbidden - Driver access required' },
        { status: 403 }
      );
    }

    const userId = session.user.id;
    console.log('🚗 Driver Jobs API - Processing for user:', userId);

    // Get driver record
    const driver = await prisma.driver.findUnique({
      where: { userId },
      select: { id: true, status: true, onboardingStatus: true }
    });

    if (!driver) {
      console.log('❌ Driver Jobs API - Driver profile not found');
      return NextResponse.json(
        { error: 'Driver profile not found' },
        { status: 404 }
      );
    }

    if (driver.status !== 'active' || driver.onboardingStatus !== 'approved') {
      console.log('❌ Driver Jobs API - Driver not active or approved:', {
        status: driver.status,
        onboardingStatus: driver.onboardingStatus
      });
      return NextResponse.json(
        { error: 'Driver account not active or not approved' },
        { status: 403 }
      );
    }

    console.log('✅ Driver Jobs API - Driver verified, fetching jobs');

    // Get driver's assigned jobs (accepted/invited)
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
      take: 50 // Limit to prevent overwhelming the UI
    });

    console.log('📊 Driver Jobs API - Found jobs:', {
      assigned: assignedJobs.length,
      available: availableJobs.length
    });

    // Transform assigned jobs
    const transformedAssignedJobs = assignedJobs.map(assignment => {
      const booking = assignment.Booking;
      const status = assignment.status === 'accepted' ? 'accepted' : 'assigned';
      
      return {
        id: booking.id,
        reference: booking.reference,
        customer: booking.customer?.name || 'Unknown Customer',
        customerPhone: booking.customer?.email || 'No contact info', // Using email as fallback for phone
        date: booking.scheduledAt.toISOString().split('T')[0],
        time: booking.scheduledAt.toTimeString().split(' ')[0].slice(0, 5),
        from: booking.pickupAddress?.label || 'Pickup Address',
        to: booking.dropoffAddress?.label || 'Dropoff Address',
        distance: booking.pickupAddress && booking.dropoffAddress 
          ? `${calculateDistance(
              booking.pickupAddress.lat || 0,
              booking.pickupAddress.lng || 0,
              booking.dropoffAddress.lat || 0,
              booking.dropoffAddress.lng || 0
            )} miles`
          : 'Unknown',
        vehicleType: 'Van', // Default vehicle type
        items: booking.items?.map(item => `${item.quantity || 1}x ${item.name || 'Unknown Item'}`).join(', ') || 'No items',
        estimatedEarnings: penceToPounds(Number(booking.totalGBP) || 0),
        status: status,
        priority: 'normal',
        duration: '2-4 hours',
        crew: '1 person'
      };
    });

    // Transform available jobs
    const transformedAvailableJobs = availableJobs.map(booking => {
      return {
        id: booking.id,
        reference: booking.reference,
        customer: booking.customer?.name || 'Unknown Customer',
        customerPhone: booking.customer?.email || 'No contact info', // Using email as fallback for phone
        date: booking.scheduledAt.toISOString().split('T')[0],
        time: booking.scheduledAt.toTimeString().split(' ')[0].slice(0, 5),
        from: booking.pickupAddress?.label || 'Pickup Address',
        to: booking.dropoffAddress?.label || 'Dropoff Address',
        distance: booking.pickupAddress && booking.dropoffAddress 
          ? `${calculateDistance(
              booking.pickupAddress.lat || 0,
              booking.pickupAddress.lng || 0,
              booking.dropoffAddress.lat || 0,
              booking.dropoffAddress.lng || 0
            )} miles`
          : 'Unknown',
        vehicleType: 'Van', // Default vehicle type
        items: booking.items?.map(item => `${item.quantity || 1}x ${item.name || 'Unknown Item'}`).join(', ') || 'No items',
        estimatedEarnings: penceToPounds(Number(booking.totalGBP) || 0),
        status: 'available',
        priority: 'normal',
        duration: '2-4 hours',
        crew: '1 person'
      };
    });

    // Combine all jobs
    const allJobs = [...transformedAssignedJobs, ...transformedAvailableJobs];

    const responseData = {
      jobs: allJobs,
      total: allJobs.length,
      available: transformedAvailableJobs.length,
      assigned: transformedAssignedJobs.length
    };

    console.log('✅ Driver Jobs API - Successfully processed jobs:', {
      total: responseData.total,
      available: responseData.available,
      assigned: responseData.assigned
    });

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('❌ Driver Jobs API - Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
