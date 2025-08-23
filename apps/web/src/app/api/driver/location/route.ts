import { NextResponse } from "next/server";
import { requireDriver } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const session = await requireDriver();
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { latitude, longitude } = await request.json();
    
    // Validate location data
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json({ error: "Invalid location coordinates" }, { status: 400 });
    }
    
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json({ error: "Location coordinates out of valid range" }, { status: 400 });
    }

    const userId = (session.user as any).id;
    
    const driver = await prisma.driver.findUnique({
      where: { userId },
      include: { availability: true }
    });

    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    // Only update location if driver is online and has given consent
    if (!driver.availability || driver.availability.status !== 'online' || !driver.availability.locationConsent) {
      return NextResponse.json({ error: "Location updates only allowed when online with consent" }, { status: 403 });
    }

    // Update driver availability with new location
    await prisma.driverAvailability.update({
      where: { driverId: driver.id },
      data: {
        lastLat: latitude,
        lastLng: longitude,
        lastSeenAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Location update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
