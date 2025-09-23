import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateCrewRecommendation } from '@/lib/driver-notifications';

// Helper function to derive timeSlot from scheduledAt
function getTimeSlotFromDate(scheduledAt: Date): string {
  const hour = scheduledAt.getHours();
  if (hour < 12) return '09:00-12:00'; // AM slot
  if (hour < 17) return '12:00-17:00'; // PM slot
  return '17:00-21:00'; // Evening slot
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Login required' },
        { status: 401 }
      );
    }

    const bookingId = params.id;

    // Get the complete booking data
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        pickupAddress: true,
        dropoffAddress: true,
        pickupProperty: true,
        dropoffProperty: true,
        items: true,
        Assignment: {
          include: {
            Driver: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Check if the driver is assigned to this job
    const isAssigned = booking.Assignment?.Driver?.id === session.user.id;
    const isDriver = (session.user as any).role === 'driver';

    if (!isAssigned && !isDriver) {
      return NextResponse.json(
        { error: 'Access denied - You are not assigned to this job' },
        { status: 403 }
      );
    }

    // Generate crew recommendation
    const crewRecommendation = await generateCrewRecommendation(booking.id, booking);

    // Format the response for the driver (excluding customer email)
    const jobDetails = {
      id: booking.id,
      reference: booking.reference,
      unifiedBookingId: booking.reference, // Using reference as unified ID
      customer: {
        name: booking.customerName,
        phone: booking.customerPhone,
        // Email is intentionally excluded for driver privacy
      },
      addresses: {
        pickup: {
          line1: booking.pickupAddress?.label,

          postcode: booking.pickupAddress?.postcode,
          coordinates: {
            lat: booking.pickupAddress?.lat,
            lng: booking.pickupAddress?.lng,
          },
        },
        dropoff: {
          line1: booking.dropoffAddress?.label,

          postcode: booking.dropoffAddress?.postcode,
          coordinates: {
            lat: booking.dropoffAddress?.lat,
            lng: booking.dropoffAddress?.lng,
          },
        },
      },
      properties: {
        pickup: {
          type: booking.pickupProperty?.propertyType,
          floors: booking.pickupProperty?.floors,
          hasElevator: booking.pickupProperty?.accessType === 'WITH_LIFT',
          hasParking: true, // Default value
          accessType: booking.pickupProperty?.accessType,
          buildingTypeDisplay: booking.pickupProperty?.propertyType?.toLowerCase().replace('_', ' ') || 'house'
        },
        dropoff: {
          type: booking.dropoffProperty?.propertyType,
          floors: booking.dropoffProperty?.floors,
          hasElevator: booking.dropoffProperty?.accessType === 'WITH_LIFT',
          hasParking: true, // Default value
          accessType: booking.dropoffProperty?.accessType,
          buildingTypeDisplay: booking.dropoffProperty?.propertyType?.toLowerCase().replace('_', ' ') || 'house'
        },
      },
      schedule: {
        date: booking.scheduledAt,
        timeSlot: booking.pickupTimeSlot || getTimeSlotFromDate(booking.scheduledAt),
        urgency: booking.urgency || 'scheduled',
        estimatedDuration: booking.estimatedDurationMinutes,
      },
      items: booking.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        volumeM3: item.volumeM3,
      })),
      pricing: {
        total: booking.totalGBP,
        breakdown: {},
      },
      crewRecommendation,
      specialRequirements: '',
      status: booking.status,
      assignment: booking.Assignment
        ? {
            id: booking.Assignment.id,
            status: booking.Assignment.status,
            claimedAt: booking.Assignment.claimedAt,
            driver: {
              id: booking.Assignment.Driver?.id,
              name: booking.Assignment.Driver?.user?.name || 'Unknown',
            },
          }
        : null,
    };

    return NextResponse.json({
      success: true,
      job: jobDetails,
    });
  } catch (error) {
    console.error('❌ Error fetching driver job details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Login required' },
        { status: 401 }
      );
    }

    const bookingId = params.id;
    const { action } = await request.json();

    // Get the booking and assignment
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        Assignment: {
          include: {
            Driver: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Check if the driver is assigned to this job
    const isAssigned = booking.Assignment?.Driver?.id === session.user.id;
    if (!isAssigned) {
      return NextResponse.json(
        { error: 'Access denied - You are not assigned to this job' },
        { status: 403 }
      );
    }

    let updateData: any = {};

    switch (action) {
      case 'accept':
        updateData = {
          status: 'claimed',
          claimedAt: new Date(),
        };
        break;

      case 'start':
        updateData = {
          status: 'in_progress',
          startedAt: new Date(),
        };
        break;

      case 'complete':
        updateData = {
          status: 'completed',
          completedAt: new Date(),
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update the assignment
    const updatedAssignment = await prisma.assignment.update({
      where: { id: booking.Assignment!.id },
      data: updateData,
    });

    // Create a job event log
    await prisma.jobEvent.create({
      data: {
        id: `je_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        assignmentId: booking.Assignment!.id,
        step:
          action === 'accept'
            ? 'navigate_to_pickup'
            : action === 'start'
              ? 'loading_started'
              : 'job_completed',
        createdBy: session.user.id,
        notes: `Driver ${action}ed the job`,
        payload: {
          action,
          timestamp: new Date().toISOString(),
          driverId: session.user.id,
        },
        mediaUrls: [],
      },
    });

    return NextResponse.json({
      success: true,
      assignment: updatedAssignment,
    });
  } catch (error) {
    console.error('❌ Error updating driver job:', error);
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    );
  }
}
