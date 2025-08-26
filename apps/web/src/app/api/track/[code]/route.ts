import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { code: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const includeTracking = searchParams.get('tracking') === 'true';

    const booking = await prisma.booking.findUnique({
      where: { reference: params.code },
      include: {
        driver: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        },
        pickupAddress: true,
        dropoffAddress: true,
        Assignment: {
          include: {
            JobEvent: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: {
                step: true,
                createdAt: true,
                notes: true
              }
            }
          }
        },
        ...(includeTracking && {
          TrackingPing: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              lat: true,
              lng: true,
              createdAt: true
            }
          }
        })
      },
    });

    if (!booking) {
      return new Response("Booking not found", { status: 404 });
    }

    // Calculate ETA and route progress
    let eta = null;
    let routeProgress = 0;
    let currentLocation = null;

    if (includeTracking && booking.TrackingPing && booking.TrackingPing.length > 0) {
      const latestPing = booking.TrackingPing[0];
      currentLocation = {
        lat: latestPing.lat,
        lng: latestPing.lng,
        timestamp: latestPing.createdAt
      };

      // Calculate route progress based on status
      switch (booking.status) {
        case 'CONFIRMED':
          routeProgress = 20;
          break;
        case 'COMPLETED':
          routeProgress = 100;
          break;
        default:
          routeProgress = 0;
      }

      // Simple ETA calculation
      if (booking.scheduledAt) {
        const now = new Date();
        const scheduledTime = new Date(booking.scheduledAt);
        const timeDiff = scheduledTime.getTime() - now.getTime();
        
        if (timeDiff > 0) {
          eta = {
            estimatedArrival: scheduledTime,
            minutesRemaining: Math.round(timeDiff / (1000 * 60))
          };
        }
      }
    }

    return Response.json({
      id: booking.id,
      reference: booking.reference,
      status: booking.status,
      pickupAddress: booking.pickupAddress,
      dropoffAddress: booking.dropoffAddress,
      scheduledAt: booking.scheduledAt,
      driver: booking.driver ? {
        name: booking.driver.user.name
      } : null,
      routeProgress,
      currentLocation,
      eta,
      lastEvent: booking.Assignment?.JobEvent[0] || null
    });
  } catch (error) {
    console.error("Error fetching tracking data:", error);
    return new Response("Internal server error", { status: 500 });
  }
}


