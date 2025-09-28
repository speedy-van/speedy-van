import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    console.log('🔍 Tracking API called for code:', params.code);
    
    const { searchParams } = new URL(request.url);
    const includeTracking = searchParams.get('tracking') === 'true';
    const realtime = searchParams.get('realtime') === 'true';
    
    console.log('📊 Tracking options:', { includeTracking, realtime });

    // Try to find booking by reference
    const booking = await prisma.booking.findFirst({
      where: {
        reference: params.code,
      },
      include: {
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
        pickupAddress: true,
        dropoffAddress: true,
        pickupProperty: true,
        dropoffProperty: true,
        Assignment: {
          include: {
            JobEvent: {
              orderBy: { createdAt: 'desc' },
              take: 10, // Get last 10 events for better tracking
              select: {
                step: true,
                createdAt: true,
                notes: true,
                payload: true,
              },
            },
          },
        },
        ...(includeTracking && {
          TrackingPing: {
            orderBy: { createdAt: 'desc' },
            take: realtime ? 50 : 10, // More pings for real-time tracking
            select: {
              lat: true,
              lng: true,
              createdAt: true,
            },
          },
        }),
      },
    });

    console.log('📋 Database query result:', booking ? 'Found' : 'Not found');

    if (!booking) {
      console.log('❌ Booking not found for code:', params.code);
      
      // Try to find any recent bookings to help with debugging
      const recentBookings = await prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { reference: true, createdAt: true, status: true }
      });
      
      console.log('📋 Recent bookings in database:', recentBookings);
      
      return Response.json({
        error: 'Booking not found',
        message: `No booking found with reference code: ${params.code}`,
        code: params.code,
        suggestion: 'Please check your reference code and try again',
        recentBookings: recentBookings.map(b => ({
          reference: b.reference,
          createdAt: b.createdAt,
          status: b.status
        }))
      }, { status: 404 });
    }

    console.log('✅ Booking found:', {
      id: booking.id,
      reference: booking.reference,
      status: booking.status,
      hasPickupAddress: !!booking.pickupAddress,
      hasDropoffAddress: !!booking.dropoffAddress,
      hasDriver: !!booking.driver,
      hasAssignment: !!booking.Assignment,
    });

    // Calculate ETA and route progress
    let eta = null;
    let routeProgress = 0;
    let currentLocation = null;
    let estimatedDuration = null;

    if (
      includeTracking &&
      booking.TrackingPing &&
      booking.TrackingPing.length > 0
    ) {
      const latestPing = booking.TrackingPing[0];
      currentLocation = {
        lat: latestPing.lat,
        lng: latestPing.lng,
        timestamp: latestPing.createdAt,
      };

      // Calculate route progress based on job events and status
      const jobEvents = booking.Assignment?.JobEvent || [];
      const currentStep = jobEvents[0]?.step;

      // Map job steps to progress percentages
      const stepProgress: Record<string, number> = {
        navigate_to_pickup: 20,
        arrived_at_pickup: 30,
        loading_started: 40,
        loading_completed: 50,
        en_route_to_dropoff: 70,
        arrived_at_dropoff: 80,
        unloading_started: 90,
        unloading_completed: 95,
        job_completed: 100,
      };

      if (currentStep && stepProgress[currentStep]) {
        routeProgress = stepProgress[currentStep];
      } else {
        // Fallback progress based on status
        switch (booking.status) {
          case 'CONFIRMED':
            routeProgress = 15;
            break;
          case 'DRAFT':
            routeProgress = 5;
            break;
          case 'PENDING_PAYMENT':
            routeProgress = 10;
            break;
          case 'COMPLETED':
            routeProgress = 100;
            break;
          default:
            routeProgress = 0;
        }
      }

      // Enhanced ETA calculation
      if (booking.scheduledAt) {
        const now = new Date();
        const scheduledTime = new Date(booking.scheduledAt);
        
        // Validate dates
        if (!isNaN(scheduledTime.getTime())) {
          const timeDiff = scheduledTime.getTime() - now.getTime();
          const minutesDiff = Math.round(timeDiff / (1000 * 60));

          if (timeDiff > 0 && !isNaN(minutesDiff)) {
            eta = {
              estimatedArrival: scheduledTime,
              minutesRemaining: Math.max(0, minutesDiff), // Ensure non-negative
              isOnTime: timeDiff > -15 * 60 * 1000, // 15 minutes grace period
            };
          } else if (timeDiff > -60 * 60 * 1000) {
            // Within 1 hour of scheduled time
            eta = {
              estimatedArrival: new Date(now.getTime() + 30 * 60 * 1000), // 30 minutes from now
              minutesRemaining: 30,
              isOnTime: false,
            };
          } else {
            // For past bookings or very late arrivals
            eta = {
              estimatedArrival: now,
              minutesRemaining: 0,
              isOnTime: false,
            };
          }
        } else {
          console.warn('⚠️ Invalid scheduledAt date:', booking.scheduledAt);
          // Fallback ETA
          eta = {
            estimatedArrival: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
            minutesRemaining: 60,
            isOnTime: true,
          };
        }
      }

      // Calculate estimated duration based on distance and current progress
      if (currentLocation && booking.pickupAddress && booking.dropoffAddress) {
        const pickupCoords = {
          lat: booking.pickupAddress.lat,
          lng: booking.pickupAddress.lng,
        };
        const dropoffCoords = {
          lat: booking.dropoffAddress.lat,
          lng: booking.dropoffAddress.lng,
        };

        // Validate coordinates
        if (isNaN(pickupCoords.lat) || isNaN(pickupCoords.lng) || 
            isNaN(dropoffCoords.lat) || isNaN(dropoffCoords.lng) ||
            pickupCoords.lat === 0 || pickupCoords.lng === 0 ||
            dropoffCoords.lat === 0 || dropoffCoords.lng === 0) {
          console.warn('⚠️ Invalid coordinates for ETA calculation:', { pickupCoords, dropoffCoords });
          estimatedDuration = booking.estimatedDurationMinutes || 60; // Fallback to 1 hour
        } else {
          // Better distance calculation (Haversine formula)
          const R = 6371; // Earth radius in km
          const dLat = (dropoffCoords.lat - pickupCoords.lat) * Math.PI / 180;
          const dLon = (dropoffCoords.lng - pickupCoords.lng) * Math.PI / 180;
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(pickupCoords.lat * Math.PI / 180) * Math.cos(dropoffCoords.lat * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c; // Distance in km

          // Calculate estimated duration based on distance and traffic conditions
          const baseSpeed = 25; // km/h average in urban areas
          const estimatedHours = distance / baseSpeed;
          const calculatedDuration = Math.round(estimatedHours * 60); // Convert to minutes
          
          // Ensure duration is valid
          if (!isNaN(calculatedDuration) && calculatedDuration > 0) {
            estimatedDuration = Math.min(calculatedDuration, 480); // Cap at 8 hours
          } else {
            estimatedDuration = booking.estimatedDurationMinutes || 60; // Fallback
          }
        }
      }
    }

    // Get tracking channel for real-time updates
    const trackingChannel = `tracking-${booking.id}`;

    // Prepare job timeline
    const jobTimeline =
      booking.Assignment?.JobEvent?.map(event => ({
        step: event.step,
        label: getStepLabel(event.step),
        timestamp: event.createdAt,
        notes: event.notes,
        payload: event.payload,
      })) || [];

    return Response.json({
      id: booking.id,
      reference: booking.reference,
      status: booking.status,
      pickupAddress: {
        label: booking.pickupAddress?.label || 'Pickup Location',
        postcode: booking.pickupAddress?.postcode || 'N/A',
        coordinates: {
          lat: booking.pickupAddress?.lat || 0,
          lng: booking.pickupAddress?.lng || 0,
        },
      },
      dropoffAddress: {
        label: booking.dropoffAddress?.label || 'Delivery Location',
        postcode: booking.dropoffAddress?.postcode || 'N/A',
        coordinates: {
          lat: booking.dropoffAddress?.lat || 0,
          lng: booking.dropoffAddress?.lng || 0,
        },
      },
      properties: {
        pickup: booking.pickupProperty ? {
          type: booking.pickupProperty.propertyType,
          floors: booking.pickupProperty.floors,
          hasElevator: booking.pickupProperty.accessType === 'WITH_LIFT',
          buildingTypeDisplay: booking.pickupProperty.propertyType?.toLowerCase().replace('_', ' ') || 'house'
        } : null,
        dropoff: booking.dropoffProperty ? {
          type: booking.dropoffProperty.propertyType,
          floors: booking.dropoffProperty.floors,
          hasElevator: booking.dropoffProperty.accessType === 'WITH_LIFT',
          buildingTypeDisplay: booking.dropoffProperty.propertyType?.toLowerCase().replace('_', ' ') || 'house'
        } : null,
      },
      scheduledAt: booking.scheduledAt,
      pickupTimeSlot: booking.pickupTimeSlot,
      urgency: booking.urgency,
      driver: booking.driver
        ? {
            name: booking.driver.user?.name || 'Driver',
            email: booking.driver.user?.email || 'N/A',
          }
        : null,
      routeProgress,
      currentLocation,
      eta: eta && eta.minutesRemaining !== undefined && !isNaN(eta.minutesRemaining) ? eta : null,
      estimatedDuration: estimatedDuration && !isNaN(estimatedDuration) ? estimatedDuration : null,
      lastEvent: booking.Assignment?.JobEvent?.[0] || null,
      jobTimeline,
      trackingChannel,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error fetching tracking data for code:', params.code, error);
    
    // Return more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return Response.json({
      error: 'Internal server error',
      message: errorMessage,
      code: params.code,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

function getStepLabel(step: string): string {
  const stepLabels: Record<string, string> = {
    navigate_to_pickup: 'En Route to Pickup',
    arrived_at_pickup: 'Arrived at Pickup',
    loading_started: 'Loading Started',
    loading_completed: 'Loading Completed',
    en_route_to_dropoff: 'En Route to Delivery',
    arrived_at_dropoff: 'Arrived at Delivery',
    unloading_started: 'Unloading Started',
    unloading_completed: 'Unloading Completed',
    job_completed: 'Job Completed',
    customer_signature: 'Customer Signature',
    damage_notes: 'Damage Notes',
    item_count_verification: 'Item Count Verification',
  };

  return (
    stepLabels[step] ||
    step.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  );
}
