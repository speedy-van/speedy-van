import { NextRequest } from 'next/server';
import { withApiHandler, requireRole, httpJson } from '@/lib/api/guard';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, "driver");
  if (auth) return auth;

  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  // Get driver data
  const driver = await prisma.driver.findUnique({
    where: { userId },
    include: {
      user: true,
      documents: true,
      checks: true,
      vehicles: true,
      availability: true,
      shifts: {
        where: { isActive: true },
        orderBy: { startTime: 'asc' }
      },
      Assignment: {
        include: {
          Booking: true
        },
        where: {
          status: {
            in: ["accepted"]
          }
        }
      }
    }
  });

  if (!driver) {
    return httpJson(404, { error: "Driver not found" });
  }

  // Calculate today's earnings using the new earnings system
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayEarnings = await prisma.driverEarnings.aggregate({
    where: {
      driverId: driver.id,
      calculatedAt: {
        gte: today,
        lt: tomorrow
      }
    },
    _sum: {
      netAmountPence: true
    }
  });

  // Get available jobs (bookings without assignments)
  const availableJobs = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      driverId: null,
      scheduledAt: {
        gte: today
      }
    },
    take: 10,
    orderBy: {
      createdAt: "desc"
    }
  });

  // Check for claimed job (assignment with status "claimed")
  const claimedAssignment = await prisma.assignment.findFirst({
    where: {
      driverId: driver.id,
      status: "claimed"
    },
    include: {
      Booking: {
        include: {
          pickupAddress: true,
          dropoffAddress: true
        }
      }
    }
  });

  let claimedJob = null;
  if (claimedAssignment) {
    claimedJob = {
      id: claimedAssignment.id,
      jobId: claimedAssignment.bookingId,
      status: claimedAssignment.status,
      expiresAt: claimedAssignment.expiresAt,
      job: {
        id: claimedAssignment.Booking.id,
        reference: claimedAssignment.Booking.reference,
        pickupAddress: claimedAssignment.Booking.pickupAddress?.label || "",
        dropoffAddress: claimedAssignment.Booking.dropoffAddress?.label || "",
        scheduledAt: claimedAssignment.Booking.scheduledAt,
        totalGBP: claimedAssignment.Booking.totalGBP
      }
    };
  }

  // Check for document alerts
  const documentAlerts = [];
  const now = new Date();

  // Check for missing required documents
  const requiredDocs = ["rtw", "licence", "insurance"];
  const uploadedDocs = driver.documents.map(doc => doc.category);
  
  for (const docType of requiredDocs) {
    if (!uploadedDocs.includes(docType as any)) {
      documentAlerts.push({
        type: "missing",
        category: docType,
        message: `Missing ${docType} document`
      });
    }
  }

  // Check for expired documents
  for (const doc of driver.documents) {
    if (doc.expiresAt && doc.expiresAt < now) {
      documentAlerts.push({
        type: "expired",
        category: doc.category,
        message: `${doc.category} document expired on ${doc.expiresAt.toLocaleDateString()}`,
        expiresAt: doc.expiresAt
      });
    } else if (doc.expiresAt && doc.expiresAt < new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)) {
      // Expiring within 30 days
      documentAlerts.push({
        type: "expiring",
        category: doc.category,
        message: `${doc.category} document expires on ${doc.expiresAt.toLocaleDateString()}`,
        expiresAt: doc.expiresAt
      });
    }
  }

  // Check license expiry
  if (driver.checks?.licenceExpiry && driver.checks.licenceExpiry < now) {
    documentAlerts.push({
      type: "expired",
      category: "licence",
      message: `Driver license expired on ${driver.checks.licenceExpiry.toLocaleDateString()}`,
      expiresAt: driver.checks.licenceExpiry
    });
  }

  // Check insurance expiry
  if (driver.checks?.policyEnd && driver.checks.policyEnd < now) {
    documentAlerts.push({
      type: "expired",
      category: "insurance",
      message: `Insurance policy expired on ${driver.checks.policyEnd.toLocaleDateString()}`,
      expiresAt: driver.checks.policyEnd
    });
  }

  // Calculate average rating from performance data
  const performance = await prisma.driverPerformance.findUnique({
    where: { driverId: driver.id }
  });
  
  const averageRating = performance?.averageRating || 0;

  return httpJson(200, {
    driver: {
      id: driver.id,
      name: driver.user.name,
      email: driver.user.email,
      status: driver.status,
      onboardingStatus: driver.onboardingStatus,
      basePostcode: driver.basePostcode,
      vehicleType: driver.vehicleType
    },
    kpis: {
      todayEarnings: todayEarnings._sum.netAmountPence || 0,
      averageRating,
      totalJobs: driver.Assignment.length,
      activeShifts: driver.shifts.length
    },
    availableJobs,
    claimedJob,
    documentAlerts,
    availability: driver.availability,
    shifts: driver.shifts
  });
});
