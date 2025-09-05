import { NextResponse } from 'next/server';
import { requireDriver } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const session = await requireDriver();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { bookingId, latitude, longitude, accuracy } = await request.json();

    // Validate location data
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json(
        { error: 'Invalid location coordinates' },
        { status: 400 }
      );
    }

    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        { error: 'Location coordinates out of valid range' },
        { status: 400 }
      );
    }

    const userId = (session.user as any).id;

    const driver = await prisma.driver.findUnique({
      where: { userId },
      include: {
        availability: true,
        Assignment: {
          where: {
            bookingId: bookingId,
            status: { in: ['claimed', 'accepted'] },
          },
          include: {
            Booking: true,
          },
        },
      },
    });

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    // Check if driver has an active assignment for this booking
    if (!driver.Assignment || driver.Assignment.length === 0) {
      return NextResponse.json(
        { error: 'No active assignment for this booking' },
        { status: 403 }
      );
    }

    // Only update location if driver is online and has given consent
    if (
      !driver.availability ||
      driver.availability.status !== 'online' ||
      !driver.availability.locationConsent
    ) {
      return NextResponse.json(
        { error: 'Location updates only allowed when online with consent' },
        { status: 403 }
      );
    }

    // Create tracking ping
    const trackingPing = await prisma.trackingPing.create({
      data: {
        id: `ping_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        bookingId: bookingId,
        driverId: driver.id,
        lat: latitude,
        lng: longitude,
      },
    });

    // Update driver availability with new location
    await prisma.driverAvailability.update({
      where: { driverId: driver.id },
      data: {
        lastLat: latitude,
        lastLng: longitude,
        lastSeenAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      trackingPingId: trackingPing.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Tracking update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const session = await requireDriver();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    const since = searchParams.get('since'); // ISO date string

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID required' },
        { status: 400 }
      );
    }

    const userId = (session.user as any).id;

    const driver = await prisma.driver.findUnique({
      where: { userId },
    });

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    // Get tracking pings for this booking
    const whereClause: any = {
      bookingId: bookingId,
      driverId: driver.id,
    };

    if (since) {
      whereClause.createdAt = {
        gte: new Date(since),
      };
    }

    const trackingPings = await prisma.trackingPing.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to last 100 pings
    });

    return NextResponse.json({
      success: true,
      trackingPings: trackingPings.map(ping => ({
        id: ping.id,
        lat: ping.lat,
        lng: ping.lng,
        createdAt: ping.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching tracking data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
