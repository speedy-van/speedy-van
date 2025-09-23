import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🎯 Job accept API called:', {
      jobId: params.id,
      url: request.url
    });

    // Check driver authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log('❌ No session found');
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== 'driver') {
      console.log('❌ User is not a driver:', { userRole, userId: session.user.id });
      return NextResponse.json(
        { error: 'Forbidden - Driver access required' },
        { status: 403 }
      );
    }

    const userId = session.user.id;
    const bookingId = params.id;

    console.log('✅ Driver authenticated:', { userId, userRole, bookingId });

    // Get driver record
    const driver = await prisma.driver.findUnique({
      where: { userId },
      select: { id: true }
    });

    if (!driver) {
      console.log('❌ Driver profile not found for user:', userId);
      return NextResponse.json(
        { error: 'Driver profile not found' },
        { status: 404 }
      );
    }

    console.log('🚗 Driver found:', { driverId: driver.id, userId });

    // Get booking to verify it's available
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        Assignment: true
      }
    });

    if (!booking) {
      console.log('❌ Booking not found:', bookingId);
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    console.log('📋 Booking details:', {
      id: booking.id,
      status: booking.status,
      driverId: booking.driverId,
      hasAssignment: !!booking.Assignment,
      assignmentId: booking.Assignment?.id,
      assignmentStatus: booking.Assignment?.status,
      createdAt: booking.createdAt
    });

    // Check if job is available for acceptance
    const isAvailable = (() => {
      // Must not have an existing assignment
      if (booking.Assignment) {
        console.log('❌ Job has existing assignment:', booking.Assignment.id);
        return false;
      }
      
      if (booking.status === 'CONFIRMED' && !booking.driverId) {
        console.log('✅ Job available: CONFIRMED status, no driver assigned');
        return true;
      }
      if (booking.status === 'PENDING_PAYMENT' && !booking.driverId) {
        // Check if created within last 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const isRecent = booking.createdAt >= fiveMinutesAgo;
        console.log('📅 Job age check:', {
          createdAt: booking.createdAt,
          fiveMinutesAgo,
          isRecent,
          status: booking.status
        });
        return isRecent;
      }
      console.log('❌ Job not available:', {
        status: booking.status,
        hasDriver: !!booking.driverId,
        hasAssignment: !!booking.Assignment
      });
      return false;
    })();

    if (!isAvailable) {
      console.log('❌ Job not available for acceptance:', {
        bookingId,
        status: booking.status,
        driverId: booking.driverId,
        hasAssignment: !!booking.Assignment
      });
      return NextResponse.json(
        { error: 'This job is no longer available' },
        { status: 400 }
      );
    }

    console.log('🎯 Accepting job:', {
      bookingId,
      driverId: driver.id,
      status: booking.status
    });

        // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      console.log('🔄 Starting transaction for job acceptance');
      
      // Update booking with driver assignment
      console.log('📝 Updating booking...');
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          driverId: driver.id,
          status: booking.status === 'PENDING_PAYMENT' ? 'CONFIRMED' : booking.status
        }
      });
      console.log('✅ Booking updated:', updatedBooking.id);

      // Create or update assignment record
      let assignment;
      if (booking.Assignment) {
        console.log('🔄 Updating existing assignment...');
        // Update existing assignment
        assignment = await tx.assignment.update({
          where: { id: booking.Assignment.id },
          data: {
            driverId: driver.id,
            status: 'accepted',
            claimedAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
            updatedAt: new Date()
          }
        });
        console.log('✅ Assignment updated:', assignment.id);
      } else {
        console.log('🆕 Creating new assignment...');
        // Create new assignment
        assignment = await tx.assignment.create({
          data: {
            id: `asg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            bookingId: bookingId,
            driverId: driver.id,
            status: 'accepted',
            claimedAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
            updatedAt: new Date()
          }
        });
        console.log('✅ Assignment created:', assignment.id);
      }

      // Create initial job event
      console.log('📋 Creating job event...');
      const jobEvent = await tx.jobEvent.create({
        data: {
          id: `je_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          assignmentId: assignment.id,
          step: 'navigate_to_pickup',
          notes: 'Job accepted by driver',
          createdBy: driver.id,
          payload: {
            timestamp: new Date().toISOString(),
            driverId: driver.id,
            action: 'accepted'
          }
        }
      });
      console.log('✅ Job event created:', jobEvent.id);

      return {
        booking: updatedBooking,
        assignment,
        jobEvent
      };
    });

    console.log('✅ Job accepted successfully:', {
      bookingId,
      driverId: driver.id,
      assignmentId: result.assignment.id,
      eventId: result.jobEvent.id
    });

    return NextResponse.json({
      success: true,
      data: {
        bookingId: result.booking.id,
        assignmentId: result.assignment.id,
        status: result.assignment.status,
        acceptedAt: result.assignment.claimedAt
      }
    });

  } catch (error) {
    console.error('❌ Error accepting job:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      bookingId: params.id
    });
    
    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'This job has already been assigned to another driver' },
          { status: 409 }
        );
      }
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { error: 'Invalid booking or driver reference' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      {
        error: 'Failed to accept job',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}