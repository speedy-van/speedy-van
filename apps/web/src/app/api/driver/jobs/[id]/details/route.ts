import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateSmartSuggestions } from '@/lib/utils/smart-suggestions';
import { penceToPounds } from '@/lib/utils/currency';

// Helper function to calculate distance between two coordinates
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

// Helper function to derive timeSlot from scheduledAt
function getTimeSlotFromDate(scheduledAt: Date): string {
  const hour = scheduledAt.getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Job details API called:', {
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

    console.log('🔍 Driver lookup result:', { driver, userId });

    if (!driver) {
      console.log('❌ Driver profile not found for user:', userId);
      return NextResponse.json(
        { error: 'Driver profile not found' },
        { status: 404 }
      );
    }

    // Get booking with complete details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        pickupAddress: true,
        dropoffAddress: true,
        pickupProperty: true,
        dropoffProperty: true,
        items: true,
        customer: {
          select: { id: true, name: true, email: true }
        },
        Assignment: {
          include: {
            JobEvent: {
              orderBy: { createdAt: 'asc' }
            }
          }
        }
      }
    });

    console.log('🔍 Booking lookup result:', { 
      bookingId, 
      found: !!booking,
      bookingDriverId: booking?.driverId,
      bookingStatus: booking?.status,
      hasAssignment: !!booking?.Assignment
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
    const hasAssignment = !!booking.Assignment;
    
    // Check if this is an available job (matches the logic in available jobs API)
    const isAvailableJob = (() => {
      if (booking.status === 'CONFIRMED' && !booking.driverId) {
        return true;
      }
      if (booking.status === 'PENDING_PAYMENT' && !booking.driverId) {
        // Check if created within last 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        return booking.createdAt >= fiveMinutesAgo;
      }
      return false;
    })();

    console.log('🔍 Job access check:', {
      bookingId,
      driverId: driver.id,
      bookingDriverId: booking.driverId,
      bookingStatus: booking.status,
      hasAssignment: !!booking.Assignment,
      isAssignedToDriver,
      isAvailableJob,
      createdAt: booking.createdAt,
      fiveMinutesAgo: new Date(Date.now() - 5 * 60 * 1000),
      driverIdType: typeof driver.id,
      bookingDriverIdType: typeof booking.driverId,
      idsMatch: driver.id === booking.driverId
    });

    if (!isAssignedToDriver && !isAvailableJob) {
      console.log('❌ Access denied for job:', bookingId);
      return NextResponse.json(
        { 
          error: 'You do not have access to this job',
          details: {
            jobId: bookingId,
            driverId: driver.id,
            bookingDriverId: booking.driverId,
            bookingStatus: booking.status,
            isAssignedToDriver,
            isAvailableJob
          }
        },
        { status: 403 }
      );
    }

    // Calculate distance
    const distance = calculateDistance(
      booking.pickupAddress?.lat || 0,
      booking.pickupAddress?.lng || 0,
      booking.dropoffAddress?.lat || 0,
      booking.dropoffAddress?.lng || 0
    );

    // Calculate driver earnings (85% of total amount)
    const totalAmount = booking.totalGBP;
    const platformFee = Math.floor(totalAmount * 0.15);
    const driverEarnings = Math.floor(totalAmount * 0.85);
    
    console.log('💰 Driver earnings calculation:', {
      totalAmount,
      platformFee,
      driverEarnings,
      bookingId: booking.id
    });

    // Calculate required workers based on items
    const totalVolume = booking.items.reduce((sum, item) => sum + (item.volumeM3 * item.quantity), 0);
    const heavyItems = booking.items.filter(item => item.volumeM3 > 0.5).length;
    const requiredWorkers = totalVolume > 10 || heavyItems > 3 ? 2 : 1;

    // Generate smart suggestions
    const smartSuggestions = generateSmartSuggestions(
      booking.items,
      booking.pickupProperty,
      booking.dropoffProperty,
      booking.scheduledAt,
      booking.pickupAddress?.postcode,
      booking.dropoffAddress?.postcode
    );

    // Format job details
    const jobDetails = {
      // Basic job info
      id: booking.id,
      reference: booking.reference,
      status: booking.status,
      
      // Assignment info
      assignment: booking.Assignment ? {
        id: booking.Assignment.id,
        status: booking.Assignment.status,
        acceptedAt: booking.Assignment.claimedAt,
        expiresAt: booking.Assignment.expiresAt,
        events: booking.Assignment.JobEvent ? booking.Assignment.JobEvent.map((event: any) => ({
          step: event.step,
          completedAt: event.createdAt,
          notes: event.notes,
          payload: event.payload
        })) : []
      } : null,
      
      // Customer information
      customer: {
        name: booking.customer?.name || booking.customerName,
        email: booking.customerEmail,
        phone: booking.customerPhone,
        canContact: true // Drivers can contact customers for assigned jobs
      },
      
      // Addresses and properties
      pickup: {
        address: booking.pickupAddress?.label || 'Pickup address not specified',
        postcode: booking.pickupAddress?.postcode,
        coordinates: {
          lat: booking.pickupAddress?.lat,
          lng: booking.pickupAddress?.lng
        },
        property: {
          type: booking.pickupProperty?.propertyType,
          floors: booking.pickupProperty?.floors || 0,
          hasElevator: booking.pickupProperty?.accessType === 'WITH_LIFT',
          hasParking: true, // Default value, could be added to schema later
          accessType: booking.pickupProperty?.accessType,
          buildingTypeDisplay: booking.pickupProperty?.propertyType?.toLowerCase().replace('_', ' ') || 'house',
          flatNumber: null, // Not available in current schema
          parkingDetails: 'Please check with customer', // Not available in current schema
          accessNotes: booking.pickupProperty?.accessType === 'WITH_LIFT' ? 
            'Lift access available' : 
            booking.pickupProperty?.floors > 0 ? 
              `Stair access only - ${booking.pickupProperty.floors} floor${booking.pickupProperty.floors > 1 ? 's' : ''}` :
              'Ground floor access'
        },
        zones: {
          isULEZ: ['EC1', 'EC2', 'EC3', 'EC4', 'WC1', 'WC2', 'SE1', 'E1'].some(prefix => 
            booking.pickupAddress?.postcode?.toUpperCase().startsWith(prefix) || false
          ),
          isLEZ: ['N1', 'E2', 'E8', 'SE11'].some(prefix => 
            booking.pickupAddress?.postcode?.toUpperCase().startsWith(prefix) || false
          ),
          hasCongestionCharge: ['EC1', 'EC2', 'EC3', 'EC4', 'WC1', 'WC2'].some(prefix => 
            booking.pickupAddress?.postcode?.toUpperCase().startsWith(prefix) || false
          )
        }
      },
      
      dropoff: {
        address: booking.dropoffAddress?.label || 'Dropoff address not specified',
        postcode: booking.dropoffAddress?.postcode,
        coordinates: {
          lat: booking.dropoffAddress?.lat,
          lng: booking.dropoffAddress?.lng
        },
        property: {
          type: booking.dropoffProperty?.propertyType,
          floors: booking.dropoffProperty?.floors || 0,
          hasElevator: booking.dropoffProperty?.accessType === 'WITH_LIFT',
          hasParking: true, // Default value, could be added to schema later
          accessType: booking.dropoffProperty?.accessType,
          buildingTypeDisplay: booking.dropoffProperty?.propertyType?.toLowerCase().replace('_', ' ') || 'house',
          flatNumber: null, // Not available in current schema
          parkingDetails: 'Please check with customer', // Not available in current schema
          accessNotes: booking.dropoffProperty?.accessType === 'WITH_LIFT' ? 
            'Lift access available' : 
            booking.dropoffProperty?.floors > 0 ? 
              `Stair access only - ${booking.dropoffProperty.floors} floor${booking.dropoffProperty.floors > 1 ? 's' : ''}` :
              'Ground floor access'
        },
        zones: {
          isULEZ: ['EC1', 'EC2', 'EC3', 'EC4', 'WC1', 'WC2', 'SE1', 'E1'].some(prefix => 
            booking.dropoffAddress?.postcode?.toUpperCase().startsWith(prefix) || false
          ),
          isLEZ: ['N1', 'E2', 'E8', 'SE11'].some(prefix => 
            booking.dropoffAddress?.postcode?.toUpperCase().startsWith(prefix) || false
          ),
          hasCongestionCharge: ['EC1', 'EC2', 'EC3', 'EC4', 'WC1', 'WC2'].some(prefix => 
            booking.dropoffAddress?.postcode?.toUpperCase().startsWith(prefix) || false
          )
        }
      },
      
      // Schedule
      schedule: {
        scheduledAt: booking.scheduledAt,
        pickupTimeSlot: booking.pickupTimeSlot || getTimeSlotFromDate(booking.scheduledAt),
        urgency: booking.urgency || 'scheduled',
        estimatedDuration: booking.estimatedDurationMinutes,
        crewSize: booking.crewSize
      },
      
      // Items to move
      items: booking.items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        volume: item.volumeM3
      })),
      
      // Financial details
      driverPayout: driverEarnings, // Add driverPayout at top level for compatibility
      pricing: {
        totalAmount: penceToPounds(booking.totalGBP),
        driverPayout: penceToPounds(driverEarnings),
        estimatedEarnings: penceToPounds(driverEarnings),
        currency: 'GBP',
        breakdown: {
          distance: penceToPounds(booking.distanceCostGBP),
          access: penceToPounds(booking.accessSurchargeGBP),
          weather: penceToPounds(booking.weatherSurchargeGBP),
          items: penceToPounds(booking.itemsSurchargeGBP)
        }
      },
      
      // Logistics
      logistics: {
        distance: distance,
        estimatedDuration: Math.ceil(distance / 20),
        requiredWorkers: requiredWorkers,
        crewSize: booking.crewSize || 'TWO'
      },
      
      // Additional info
      metadata: {
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        baseDistance: booking.baseDistanceMiles,
        isAssignedToYou: isAssignedToDriver,
        isAvailable: isAvailableJob
      },
      
      // Smart suggestions for driver
      smartSuggestions: smartSuggestions
    };

    console.log(`✅ Job details loaded for driver ${driver.id}:`, {
      bookingId,
      reference: booking.reference,
      isAssigned: isAssignedToDriver,
      estimatedEarnings: driverEarnings
    });

    return NextResponse.json({
      success: true,
      data: jobDetails
    });

  } catch (error) {
    console.error('❌ Error loading job details:', error);
    return NextResponse.json(
      {
        error: 'Failed to load job details',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
