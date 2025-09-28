import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🚗 Driver Job Accept API - Starting request for job:', params.id);
    
    // Check driver authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log('❌ Driver Job Accept API - No session found');
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== 'driver') {
      console.log('❌ Driver Job Accept API - Invalid role:', userRole);
      return NextResponse.json(
        { error: 'Forbidden - Driver access required' },
        { status: 403 }
      );
    }

    const userId = session.user.id;
    console.log('🚗 Driver Job Accept API - Processing for user:', userId);

    // Get driver record
    const driver = await prisma.driver.findUnique({
      where: { userId },
      select: { id: true, status: true, onboardingStatus: true }
    });

    if (!driver) {
      console.log('❌ Driver Job Accept API - Driver profile not found');
      return NextResponse.json(
        { error: 'Driver profile not found' },
        { status: 404 }
      );
    }

    if (driver.status !== 'active' || driver.onboardingStatus !== 'approved') {
      console.log('❌ Driver Job Accept API - Driver not active or approved');
      return NextResponse.json(
        { error: 'Driver account not active or not approved' },
        { status: 403 }
      );
    }

    const bookingId = params.id;

    // Check if the booking exists and is available
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        Assignment: true
      }
    });

    if (!booking) {
      console.log('❌ Driver Job Accept API - Booking not found:', bookingId);
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (booking.status !== 'CONFIRMED') {
      console.log('❌ Driver Job Accept API - Booking not confirmed:', booking.status);
      return NextResponse.json(
        { error: 'Booking is not available for acceptance' },
        { status: 400 }
      );
    }

    // Check if already assigned to another driver
    const existingAssignment = await prisma.assignment.findFirst({
      where: {
        bookingId: bookingId,
        status: { in: ['accepted', 'invited'] }
      }
    });

    if (existingAssignment) {
      console.log('❌ Driver Job Accept API - Booking already assigned');
      return NextResponse.json(
        { error: 'This job has already been assigned to another driver' },
        { status: 400 }
      );
    }

    console.log('✅ Driver Job Accept API - Creating assignment');

    // Create assignment and update booking
    await prisma.$transaction(async (tx) => {
      // Create the assignment
      await tx.assignment.create({
        data: {
          id: `assign_${bookingId}_${driver.id}`,
          driverId: driver.id,
          bookingId: bookingId,
          status: 'accepted',
          updatedAt: new Date()
        }
      });

      // Update the booking to assign it to the driver
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          driverId: driver.id,
          status: 'CONFIRMED'
        }
      });
    });

    console.log('✅ Driver Job Accept API - Successfully accepted job:', bookingId);

    return NextResponse.json({
      success: true,
      message: 'Job accepted successfully'
    });

  } catch (error) {
    console.error('❌ Driver Job Accept API - Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}