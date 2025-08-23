import { NextResponse } from "next/server";
import { requireDriver } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function PUT(request: Request) {
  const session = await requireDriver();
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { availability, latitude, longitude, locationConsent } = await request.json();
    
    if (!availability || !["online", "break", "offline"].includes(availability)) {
      return NextResponse.json({ error: "Invalid availability status" }, { status: 400 });
    }

    // Validate location data if provided
    if (latitude !== undefined && longitude !== undefined) {
      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        return NextResponse.json({ error: "Invalid location coordinates" }, { status: 400 });
      }
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return NextResponse.json({ error: "Location coordinates out of valid range" }, { status: 400 });
      }
    }

    const userId = (session.user as any).id;
    
    // Get or create driver availability
    const driver = await prisma.driver.findUnique({
      where: { userId },
      include: { availability: true }
    });

    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    // Update or create driver availability
    const updateData: any = {
      status: availability,
      lastSeenAt: new Date()
    };

    // Add location data if provided
    if (latitude !== undefined && longitude !== undefined) {
      updateData.lastLat = latitude;
      updateData.lastLng = longitude;
    }

    // Add location consent if provided
    if (locationConsent !== undefined) {
      updateData.locationConsent = locationConsent;
    }

    if (driver.availability) {
      await prisma.driverAvailability.update({
        where: { driverId: driver.id },
        data: updateData
      });
    } else {
      await prisma.driverAvailability.create({
        data: {
          driverId: driver.id,
          ...updateData
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      availability 
    });

  } catch (error) {
    console.error("Availability update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
