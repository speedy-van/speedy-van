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
    console.log('🔄 Job step update API called:', {
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

    // Get booking to verify access
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

    // Check if driver has access to this job
    const isAssignedToDriver = booking.driverId === driver.id;
    const hasAssignment = booking.Assignment && booking.Assignment.driverId === driver.id;

    if (!isAssignedToDriver && !hasAssignment) {
      console.log('❌ Access denied for job:', bookingId);
      return NextResponse.json(
        { error: 'You do not have access to this job' },
        { status: 403 }
      );
    }

    // Parse JSON body
    const body = await request.json();
    const { step, notes = '' } = body;

    if (!step) {
      return NextResponse.json(
        { error: 'Step is required' },
        { status: 400 }
      );
    }

    console.log('📝 Updating job step:', {
      bookingId,
      driverId: driver.id,
      step,
      notes: notes.substring(0, 50) + (notes.length > 50 ? '...' : '')
    });

    // Get or create assignment
    let assignment = booking.Assignment;
    
    if (!assignment) {
      // Create assignment if it doesn't exist
      assignment = await prisma.assignment.create({
        data: {
          id: `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          bookingId: bookingId,
          driverId: driver.id,
          status: 'accepted',
          claimedAt: new Date(),
          updatedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
        }
      });
    }

    // Create job event
    const jobEvent = await prisma.jobEvent.create({
      data: {
        id: `je_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        assignmentId: assignment.id,
        step: step as any, // Cast to JobStep enum
        notes: notes,
        createdBy: driver.id,
        payload: {
          timestamp: new Date().toISOString(),
          driverId: driver.id
        }
      }
    });

    // Update assignment status based on step
    let newStatus = assignment.status;
    if (step === 'job_completed') {
      newStatus = 'completed';
      
      // Create driver earnings when job is completed
      const booking = await prisma.booking.findUnique({
        where: { id: assignment.bookingId },
        select: { totalGBP: true, reference: true, customerName: true, id: true }
      });
      
      if (booking) {
        const totalAmount = booking.totalGBP;
        const platformFee = Math.floor(totalAmount * 0.15);
        const driverEarnings = Math.floor(totalAmount * 0.85);
        
        // Create driver earnings record
        await prisma.driverEarnings.create({
          data: {
            driverId: driver.id,
            assignmentId: assignment.id,
            baseAmountPence: driverEarnings,
            surgeAmountPence: 0, // No surge for now
            tipAmountPence: 0, // No tips for now
            feeAmountPence: platformFee,
            netAmountPence: driverEarnings,
            currency: 'GBP',
            calculatedAt: new Date(),
            paidOut: false
          }
        });
        
        console.log('💰 Driver earnings created:', {
          driverId: driver.id,
          assignmentId: assignment.id,
          earnings: driverEarnings,
          bookingReference: booking.reference
        });

        // Update booking status to COMPLETED when driver completes the job
        await prisma.booking.update({
          where: { id: booking.id },
          data: { 
            status: 'COMPLETED',
            updatedAt: new Date()
          }
        });

        console.log('✅ Booking marked as COMPLETED:', {
          bookingId: booking.id,
          bookingReference: booking.reference,
          driverId: driver.id
        });

        // Send admin notification about order completion
        try {
          const { getPusherServer } = await import('@/lib/pusher');
          const pusher = getPusherServer();

          // Get driver details for notification
          const driverDetails = await prisma.driver.findUnique({
            where: { id: driver.id },
            include: { user: { select: { name: true } } }
          });

          // Notify admin dashboard about order completion
          await pusher.trigger('admin-notifications', 'order-completed', {
            bookingId: booking.id,
            bookingReference: booking.reference,
            customerName: booking.customerName,
            driverName: driverDetails?.user.name || 'Unknown Driver',
            completedAt: new Date().toISOString(),
            message: `Order ${booking.reference} has been completed by driver ${driverDetails?.user.name || 'Unknown'}`,
          });

          console.log('✅ Admin notification sent for order completion:', {
            bookingId: booking.id,
            bookingReference: booking.reference,
            driverName: driverDetails?.user.name
          });
        } catch (notificationError) {
          console.error('❌ Error sending admin notification for order completion:', notificationError);
          // Don't fail the request if notification fails
        }
      }
    } else if (step === 'navigate_to_pickup' && assignment.status === 'invited') {
      newStatus = 'accepted';
    }

    if (newStatus !== assignment.status) {
      await prisma.assignment.update({
        where: { id: assignment.id },
        data: { status: newStatus }
      });
    }

    console.log('✅ Job step updated successfully:', {
      bookingId,
      step,
      eventId: jobEvent.id,
      newStatus
    });

    return NextResponse.json({
      success: true,
      data: {
        eventId: jobEvent.id,
        step: jobEvent.step,
        notes: jobEvent.notes,
        createdAt: jobEvent.createdAt,
        assignmentStatus: newStatus
      }
    });

  } catch (error) {
    console.error('❌ Error updating job step:', error);
    return NextResponse.json(
      {
        error: 'Failed to update job step',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}