import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Helper function to check if driver has active orders
async function hasActiveOrders(driverId: string): Promise<boolean> {
  const activeAssignments = await prisma.assignment.findMany({
    where: {
      driverId: driverId,
      status: {
        in: ['invited', 'claimed', 'accepted']
      }
    }
  });
  return activeAssignments.length > 0;
}

// GET driver availability status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user as any).role !== 'driver') {
      return NextResponse.json(
        { error: 'Unauthorized - Driver access required' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    // Get driver record
    const driver = await prisma.driver.findUnique({
      where: { userId: userId },
      include: {
        availability: true,
      },
    });

    if (!driver) {
      return NextResponse.json(
        { error: 'Driver record not found' },
        { status: 404 }
      );
    }

    const availability = driver.availability;

    // Get or create default availability settings - Default to online
    const defaultSettings = {
      isAvailable: availability?.status === 'online' || !availability,
      availabilityMode: (availability?.status as 'online' | 'offline' | 'break') || 'online',
      workingHours: {
        monday: { start: '09:00', end: '17:00', enabled: true },
        tuesday: { start: '09:00', end: '17:00', enabled: true },
        wednesday: { start: '09:00', end: '17:00', enabled: true },
        thursday: { start: '09:00', end: '17:00', enabled: true },
        friday: { start: '09:00', end: '17:00', enabled: true },
        saturday: { start: '09:00', end: '17:00', enabled: false },
        sunday: { start: '09:00', end: '17:00', enabled: false },
      },
      maxDistance: 100, // Increased to 100 miles for UK-wide coverage
      serviceAreas: ['UK-WIDE'], // UK-wide coverage by default
      coverageType: 'uk-wide', // New field to indicate coverage type
      breakUntil: null,
    };

    // Check for active orders
    const driverHasActiveOrders = await hasActiveOrders(driver.id);
    
    return NextResponse.json({
      success: true,
      data: {
        isOnline: defaultSettings.isAvailable,
        acceptingJobs: defaultSettings.isAvailable, // For now, accepting jobs when online
        locationConsent: availability?.locationConsent ?? true, // Default to true
        hasActiveOrders: driverHasActiveOrders,
        currentLocation: availability?.lastLat && availability?.lastLng ? {
          lat: availability.lastLat,
          lng: availability.lastLng,
        } : undefined,
      },
    });

  } catch (error) {
    console.error('❌ Error fetching driver availability:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch availability',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT/POST update driver availability
export async function PUT(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}

async function handler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user as any).role !== 'driver') {
      return NextResponse.json(
        { error: 'Unauthorized - Driver access required' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const body = await request.json();

    // Get driver record
    const driver = await prisma.driver.findUnique({
      where: { userId: userId },
      select: { id: true },
    });

    if (!driver) {
      return NextResponse.json(
        { error: 'Driver record not found' },
        { status: 404 }
      );
    }

    // Check if driver has active orders
    const driverHasActiveOrders = await hasActiveOrders(driver.id);
    
    // Update availability based on settings
    const updateData: any = {
      lastSeenAt: new Date(),
    };

    if (body.isAvailable !== undefined) {
      updateData.status = body.isAvailable ? 'online' : 'offline';
      
      // Automatically enable location sharing when going online
      if (body.isAvailable) {
        updateData.locationConsent = true;
      } else if (!driverHasActiveOrders) {
        // Only disable location sharing if no active orders
        updateData.locationConsent = false;
      }
    }

    if (body.availabilityMode) {
      updateData.status = body.availabilityMode;
      
      // Automatically manage location sharing based on availability
      if (body.availabilityMode === 'online') {
        updateData.locationConsent = true;
      } else if (body.availabilityMode === 'offline' && !driverHasActiveOrders) {
        updateData.locationConsent = false;
      }
    }

    if (body.breakUntil) {
      updateData.breakUntil = new Date(body.breakUntil);
    }

    // Handle explicit location consent updates
    if (body.locationConsent !== undefined) {
      // If driver has active orders, force location sharing to remain enabled
      if (driverHasActiveOrders && !body.locationConsent) {
        console.log('🚨 Cannot disable location sharing - driver has active orders');
        return NextResponse.json(
          { 
            error: 'Cannot disable location sharing while you have active orders',
            activeOrders: true 
          },
          { status: 400 }
        );
      }
      updateData.locationConsent = body.locationConsent;
    }

    const updatedAvailability = await prisma.driverAvailability.upsert({
      where: { driverId: driver.id },
      create: {
        driverId: driver.id,
        status: 'online', // Default to online for new records
        ...updateData,
      },
      update: updateData,
    });

    console.log('✅ Driver availability updated:', {
      driverId: driver.id,
      status: updatedAvailability.status,
      locationConsent: updatedAvailability.locationConsent,
    });

    // If driver just went online and is accepting jobs, trigger job matching
    if (updateData.status === 'online' && updateData.locationConsent) {
      // In a real system, this would trigger a background job to find matching jobs
      console.log('🔍 Driver is now online and accepting jobs - triggering job matching');
      
      // You could call a separate service here to:
      // 1. Find nearby available jobs
      // 2. Send push notifications about relevant jobs
      // 3. Update driver's position in the matching algorithm
    }

    // Return updated settings
    const updatedSettings = {
      isAvailable: updatedAvailability.status === 'online',
      availabilityMode: updatedAvailability.status,
      workingHours: {
        monday: { start: '09:00', end: '17:00', enabled: true },
        tuesday: { start: '09:00', end: '17:00', enabled: true },
        wednesday: { start: '09:00', end: '17:00', enabled: true },
        thursday: { start: '09:00', end: '17:00', enabled: true },
        friday: { start: '09:00', end: '17:00', enabled: true },
        saturday: { start: '09:00', end: '17:00', enabled: false },
        sunday: { start: '09:00', end: '17:00', enabled: false },
      },
      maxDistance: 100, // UK-wide coverage
      serviceAreas: ['UK-WIDE'],
      coverageType: 'uk-wide',
      breakUntil: null,
    };

    return NextResponse.json({
      success: true,
      message: 'Availability updated successfully',
      data: {
        isOnline: updatedSettings.isAvailable,
        acceptingJobs: updatedSettings.isAvailable, // For now, accepting jobs when online
        currentLocation: updatedAvailability.lastLat && updatedAvailability.lastLng ? {
          lat: updatedAvailability.lastLat,
          lng: updatedAvailability.lastLng,
        } : undefined,
      },
    });

  } catch (error) {
    console.error('❌ Error updating driver availability:', error);
    return NextResponse.json(
      {
        error: 'Failed to update availability',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
