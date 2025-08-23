import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/portal/bookings/:id/track (secure ETA + positions)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireRole('customer');
    const customerId = (session!.user as any).id as string;
    const bookingId = params.id;

    // Get booking with driver and tracking info
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        customerId,
        status: {
          in: ['CONFIRMED']
        }
      },
      select: {
        id: true,
        reference: true,
        status: true,
        scheduledAt: true,
        driver: {
          select: {
            id: true,
            user: {
              select: {
                name: true
              }
            },
            rating: true
          }
        },
        Assignment: {
          select: {
            id: true,
            status: true,
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
        TrackingPing: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            lat: true,
            lng: true,
            createdAt: true
          }
        }
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found or not trackable' },
        { status: 404 }
      );
    }

    // Calculate ETA based on current status and location
    let eta = null;
    let currentLocation = null;
    let routeProgress = 0;

    if (booking.TrackingPing.length > 0) {
      const latestPing = booking.TrackingPing[0];
      currentLocation = {
        lat: latestPing.lat,
        lng: latestPing.lng,
        timestamp: latestPing.createdAt
      };

      // Calculate route progress based on status
      switch (booking.status) {
        case 'CONFIRMED':
          routeProgress = 50;
          break;
        default:
          routeProgress = 0;
      }

      // Simple ETA calculation (in production, use proper routing service)
      const now = new Date();
      const bookingTime = booking.scheduledAt ? new Date(booking.scheduledAt) : now;
      const timeDiff = bookingTime.getTime() - now.getTime();
      
      if (timeDiff > 0) {
        eta = {
          estimatedArrival: bookingTime,
          minutesRemaining: Math.round(timeDiff / (1000 * 60))
        };
      }
    }

    return NextResponse.json({
      booking: {
        id: booking.id,
        reference: booking.reference,
        status: booking.status,
        driver: booking.driver,
        routeProgress,
        currentLocation,
        eta,
        lastEvent: booking.Assignment?.JobEvent[0] || null
      }
    });
  } catch (error) {
    console.error('Error fetching tracking data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracking data' },
      { status: 500 }
    );
  }
}
