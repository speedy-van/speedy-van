import { NextResponse } from "next/server";
import { requireDriver } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = await requireDriver();
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { searchParams } = new URL(request.url);
  
  // Get query parameters
  const radius = parseInt(searchParams.get('radius') || '700'); // miles (increased from 50km to 700 miles)
  const vehicleType = searchParams.get('vehicleType'); // Note: vanSize field removed, vehicleType filtering disabled
  const minCapacity = searchParams.get('minCapacity');
  const maxCapacity = searchParams.get('maxCapacity');
  const date = searchParams.get('date');
  const timeSlot = searchParams.get('timeSlot'); // Note: timeSlot field removed, timeSlot filtering disabled

  try {
    // Get driver data with location
    const driver = await prisma.driver.findUnique({
      where: { userId },
      include: {
        availability: true,
        vehicles: true,
        checks: true,
        documents: true
      }
    });

    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    // Check if driver is approved and has required documents
    if (driver.onboardingStatus !== 'approved') {
      return NextResponse.json({ 
        error: "Driver not approved", 
        reason: "onboarding_incomplete" 
      }, { status: 403 });
    }

    // Check for expired documents that would block job claiming
    const now = new Date();
    const expiredDocs = driver.documents.filter(doc => 
      doc.expiresAt && doc.expiresAt < now
    );

    if (expiredDocs.length > 0) {
      return NextResponse.json({ 
        error: "Documents expired", 
        reason: "expired_documents",
        expiredDocs: expiredDocs.map(doc => doc.category)
      }, { status: 403 });
    }

    // Check license expiry
    if (driver.checks?.licenceExpiry && driver.checks.licenceExpiry < now) {
      return NextResponse.json({ 
        error: "License expired", 
        reason: "expired_license" 
      }, { status: 403 });
    }

    // Check insurance expiry
    if (driver.checks?.policyEnd && driver.checks.policyEnd < now) {
      return NextResponse.json({ 
        error: "Insurance expired", 
        reason: "expired_insurance" 
      }, { status: 403 });
    }

    // Build query for available jobs
    const whereClause: any = {
      status: "CONFIRMED", // Updated to match new enum
      driverId: null, // No driver assigned
      scheduledAt: {
        gte: new Date() // Future or today
      }
    };

    // Add date filter if specified
    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);
      
      whereClause.scheduledAt = {
        gte: targetDate,
        lt: nextDate
      };
    }

    // Note: timeSlot filtering removed as field no longer exists
    // Note: vehicleType filtering removed as vanSize field no longer exists

    // Get available jobs
    const availableJobs = await prisma.booking.findMany({
      where: whereClause,
      include: {
        Assignment: true, // Check if there's an existing assignment
        pickupAddress: true,
        dropoffAddress: true
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 50 // Limit results
    });

    // Filter out jobs that already have assignments
    const trulyAvailableJobs = availableJobs.filter(job => !job.Assignment);

    // Calculate distance and filter by radius if driver has location
    let jobsWithDistance = trulyAvailableJobs;
    if (driver.availability?.lastLat && driver.availability?.lastLng) {
      jobsWithDistance = trulyAvailableJobs.map(job => {
        if (job.pickupAddress?.lat && job.pickupAddress?.lng) {
          const distance = calculateDistance(
            driver.availability!.lastLat!,
            driver.availability!.lastLng!,
            job.pickupAddress.lat,
            job.pickupAddress.lng
          );
          return { ...job, distance };
        }
        return { ...job, distance: null };
      }).filter(job => !(job as any).distance || (job as any).distance <= radius);
    }

    // Sort by distance if available, otherwise by creation date
    jobsWithDistance.sort((a, b) => {
      const aDistance = (a as any).distance;
      const bDistance = (b as any).distance;
      if (aDistance && bDistance) {
        return aDistance - bDistance;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({
      jobs: jobsWithDistance.map(job => ({
        id: job.id,
        reference: job.reference,
        pickupAddress: job.pickupAddress?.label || '',
        dropoffAddress: job.dropoffAddress?.label || '',
        pickupLat: job.pickupAddress?.lat || 0,
        pickupLng: job.pickupAddress?.lng || 0,
        dropoffLat: job.dropoffAddress?.lat || 0,
        dropoffLng: job.dropoffAddress?.lng || 0,
        scheduledAt: job.scheduledAt,
        crewSize: job.crewSize,
        totalGBP: job.totalGBP,
        distance: (job as any).distance,
        baseDistanceMiles: job.baseDistanceMiles,
        estimatedDurationMinutes: job.estimatedDurationMinutes,
        createdAt: job.createdAt,
        // Note: vanSize and timeSlot fields removed as they no longer exist in the schema
        // These will be undefined/null in the response
        vanSize: undefined,
        timeSlot: undefined
      })),
      filters: {
        radius,
        vehicleType: undefined, // Disabled as vanSize field removed
        minCapacity,
        maxCapacity,
        date,
        timeSlot: undefined // Disabled as timeSlot field removed
      },
      driverLocation: driver.availability?.lastLat && driver.availability?.lastLng ? {
        lat: driver.availability.lastLat,
        lng: driver.availability.lastLng
      } : null
    });

  } catch (error) {
    console.error("Available jobs API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in miles
}
