import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getPusherServer } from '@/lib/pusher';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { code } = params;
    const { driverId, reason } = await request.json();

    if (!driverId) {
      return NextResponse.json(
        { error: 'Driver ID is required' },
        { status: 400 }
      );
    }

    console.log('🚗 Admin assigning driver to order:', { code, driverId, reason });

    // Get the booking with detailed logging
    console.log('📋 Looking for booking with reference:', code);
    const booking = await prisma.booking.findFirst({
      where: { reference: code },
      include: {
        driver: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        },
        Assignment: {
          include: {
            Driver: {
              include: {
                user: {
                  select: { name: true, email: true }
                }
              }
            }
          }
        }
      }
    });

    console.log('📋 Booking found:', booking ? {
      id: booking.id,
      reference: booking.reference,
      status: booking.status,
      hasAssignment: !!booking.Assignment,
      currentDriver: booking.driver?.user?.name || 'None'
    } : 'Not found');

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if booking is in a valid state for assignment
    if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot assign driver to cancelled or completed booking' },
        { status: 400 }
      );
    }

    // Get the driver with detailed logging
    console.log('👤 Looking for driver with ID:', driverId);
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      include: {
        user: {
          select: { name: true, email: true } // phone removed - not in schema
        },
        availability: true
      }
    });

    console.log('👤 Driver found:', driver ? {
      id: driver.id,
      name: driver.user.name,
      hasAvailability: !!driver.availability,
      availabilityStatus: driver.availability?.status || 'No availability record'
    } : 'Not found');

    if (!driver) {
      return NextResponse.json(
        { error: 'Driver not found' },
        { status: 404 }
      );
    }

    // Check if driver is available
    if (!driver.availability) {
      return NextResponse.json(
        { error: 'Driver availability not found' },
        { status: 400 }
      );
    }

    // Check driver status (allow AVAILABLE and online status)
    const validStatuses = ['AVAILABLE', 'online', 'available'];
    if (!validStatuses.includes(driver.availability.status)) {
      return NextResponse.json(
        { error: `Driver is not available for assignments (status: ${driver.availability.status})` },
        { status: 400 }
      );
    }

    // Use transaction to ensure data consistency
    console.log('🔄 Starting database transaction...');
    const result = await prisma.$transaction(async (tx) => {
      console.log('💾 Transaction started successfully');
      // If there's an existing assignment, remove it
      if (booking.Assignment) {
        const existingAssignment = booking.Assignment;
        
        // Create job event for removal
        const removalEventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_removed`;
        console.log('📝 Creating removal job event with ID:', removalEventId);
        
        await tx.jobEvent.create({
          data: {
            id: removalEventId,
            assignmentId: existingAssignment.id,
            step: 'job_completed', // Use valid enum value
            payload: {
              removedBy: 'admin',
              reason: reason || 'Reassigned to different driver',
              removedAt: new Date().toISOString(),
              action: 'job_removed', // Store actual action in payload
            },
            notes: `Job removed from driver ${existingAssignment.Driver.user.name} by admin`,
            createdBy: (session.user as any).id,
          }
        });

        // Update existing assignment status
        await tx.assignment.update({
          where: { id: existingAssignment.id },
          data: {
            status: 'cancelled',
            updatedAt: new Date(),
          }
        });

        console.log('✅ Removed existing assignment from driver:', existingAssignment.Driver.user.name);
      }

      // Create new assignment with unique ID
      const assignmentId = `assignment_${Date.now()}_${booking.id}_${driverId}`;
      console.log('📝 Creating new assignment with ID:', assignmentId);
      
      const newAssignment = await tx.assignment.create({
        data: {
          id: assignmentId,
          bookingId: booking.id,
          driverId: driverId,
          status: 'accepted',
          claimedAt: new Date(),
          updatedAt: new Date(),
        }
      });

      // Update booking with new driver
      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: {
          driverId: driverId,
          status: 'CONFIRMED', // Ensure it's confirmed
          updatedAt: new Date(),
        }
      });

      // Create job event for new assignment
      const assignmentEventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_assigned`;
      console.log('📝 Creating assignment job event with ID:', assignmentEventId);
      
      await tx.jobEvent.create({
        data: {
          id: assignmentEventId,
          assignmentId: newAssignment.id,
          step: 'navigate_to_pickup', // Use valid enum value for new assignment
          payload: {
            assignedBy: 'admin',
            reason: reason || 'Assigned by admin',
            assignedAt: new Date().toISOString(),
            action: 'job_assigned', // Store actual action in payload
          },
          notes: `Job assigned to driver ${driver.user.name} by admin`,
          createdBy: (session.user as any).id,
        }
      });

      console.log('✅ Transaction completed successfully');
      return { updatedBooking, newAssignment };
    });

    console.log('🎉 Assignment operation completed:', {
      bookingId: result.updatedBooking.id,
      assignmentId: result.newAssignment.id,
      driverAssigned: driver.user.name
    });

    // Send real-time notifications
    try {
      const pusher = getPusherServer();

      // Notify the new driver
      await pusher.trigger(`driver-${driverId}`, 'job-assigned', {
        bookingId: booking.id,
        bookingReference: booking.reference,
        customerName: booking.customerName,
        pickupAddress: 'N/A', // pickupAddress not available
        dropoffAddress: 'N/A', // dropoffAddress not available
        assignedAt: new Date().toISOString(),
        message: 'You have been assigned a new job',
      });

      // Notify other drivers that job is no longer available
      await pusher.trigger('drivers-channel', 'job-assigned-to-other', {
        bookingId: booking.id,
        bookingReference: booking.reference,
        assignedTo: driver.user.name,
        message: 'This job has been assigned to another driver',
      });

      // Notify customer about driver assignment
      await pusher.trigger(`booking-${booking.reference}`, 'driver-assigned', {
        driverName: driver.user.name,
        // driverPhone removed - not in schema
        assignedAt: new Date().toISOString(),
        message: 'Your driver has been assigned and will contact you soon',
      });

      // Notify admin dashboard
      await pusher.trigger('admin-notifications', 'driver-assigned', {
        bookingId: booking.id,
        bookingReference: booking.reference,
        driverName: driver.user.name,
        assignedAt: new Date().toISOString(),
      });

      console.log('✅ Real-time notifications sent for driver assignment');
    } catch (notificationError) {
      console.error('❌ Error sending real-time notifications:', notificationError);
      // Don't fail the request if notifications fail
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorId: (session.user as any).id,
        actorRole: 'admin',
        action: 'driver_assigned',
        targetType: 'booking',
        targetId: booking.id,
        details: {
          bookingReference: booking.reference,
          driverId: driverId,
          driverName: driver.user.name,
          reason: reason || 'Assigned by admin',
          assignedAt: new Date().toISOString(),
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Driver assigned successfully',
      data: {
        bookingId: booking.id,
        bookingReference: booking.reference,
        driver: {
          id: driver.id,
          name: driver.user.name,
          email: driver.user.email,
          // phone removed - not in schema
        },
        assignmentId: result.newAssignment.id,
        assignedAt: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('❌ Error assigning driver:', error);
    return NextResponse.json(
      {
        error: 'Failed to assign driver',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
