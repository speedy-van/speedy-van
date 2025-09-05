import { NextResponse } from 'next/server';
import { requireDriver } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await requireDriver();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = (session.user as any).id;

    // Get driver availability
    const driver = await prisma.driver.findUnique({
      where: { userId },
      include: { availability: true },
    });

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    if (!driver.availability) {
      return NextResponse.json({
        status: 'offline',
        location: null,
        lastSeenAt: null,
      });
    }

    return NextResponse.json({
      status: driver.availability.status,
      location:
        driver.availability.lastLat && driver.availability.lastLng
          ? {
              lat: driver.availability.lastLat,
              lng: driver.availability.lastLng,
            }
          : null,
      lastSeenAt: driver.availability.lastSeenAt,
    });
  } catch (error) {
    console.error('Availability fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const session = await requireDriver();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('Session data:', {
    userId: (session.user as any)?.id,
    email: (session.user as any)?.email,
    role: (session.user as any)?.role,
  });

  try {
    let body;
    try {
      body = await request.json();
      console.log('Availability update request body:', body);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { status, location, locationConsent } = body;

    console.log('Status validation:', {
      status,
      statusType: typeof status,
      isValid: status && ['online', 'break', 'offline'].includes(status),
    });

    if (!status || !['online', 'break', 'offline'].includes(status)) {
      console.log('Invalid status:', status);
      return NextResponse.json(
        { error: 'Invalid availability status' },
        { status: 400 }
      );
    }

    // Validate location data if provided
    let latitude, longitude;
    console.log('Location validation:', {
      hasLocation: !!location,
      locationType: typeof location,
      locationKeys: location ? Object.keys(location) : null,
    });

    if (location && typeof location === 'object') {
      console.log('Location data received:', location);
      latitude = location.lat;
      longitude = location.lng;

      console.log('Extracted coordinates:', { lat: latitude, lng: longitude });

      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        console.log('Invalid coordinate types:', {
          lat: typeof latitude,
          lng: typeof longitude,
        });
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
        console.log('Coordinates out of range:', {
          lat: latitude,
          lng: longitude,
        });
        return NextResponse.json(
          { error: 'Location coordinates out of valid range' },
          { status: 400 }
        );
      }
    }

    const userId = (session.user as any).id;
    console.log('Looking up driver for userId:', userId);

    // Get or create driver availability
    const driver = await prisma.driver.findUnique({
      where: { userId },
      include: { availability: true },
    });

    if (!driver) {
      console.log('Driver not found for userId:', userId);
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    console.log('Driver found:', {
      id: driver.id,
      hasAvailability: !!driver.availability,
    });

    // Update or create driver availability
    const updateData: any = {
      status: status,
      lastSeenAt: new Date(),
    };

    // Add location data if provided
    if (latitude !== undefined && longitude !== undefined) {
      updateData.lastLat = latitude;
      updateData.lastLng = longitude;
    }

    // Add location consent if provided
    console.log('Location consent:', {
      locationConsent,
      locationConsentType: typeof locationConsent,
      willInclude: locationConsent !== undefined,
    });

    if (locationConsent !== undefined) {
      updateData.locationConsent = locationConsent;
    }

    console.log('Final update data:', updateData);

    try {
      if (driver.availability) {
        console.log('Updating existing availability for driver:', driver.id);
        await prisma.driverAvailability.update({
          where: { driverId: driver.id },
          data: updateData,
        });
        console.log('Availability updated successfully');
      } else {
        console.log('Creating new availability for driver:', driver.id);
        await prisma.driverAvailability.create({
          data: {
            driverId: driver.id,
            ...updateData,
          },
        });
        console.log('Availability created successfully');
      }
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      return NextResponse.json(
        { error: 'Database operation failed' },
        { status: 500 }
      );
    }

    const response = {
      success: true,
      status,
    };
    console.log('Sending response:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Availability update error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
