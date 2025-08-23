import { NextResponse } from "next/server";
import { requireDriver } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await requireDriver();
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    // Get driver data
    const driver = await prisma.driver.findUnique({
      where: { userId },
      include: {
        performance: true,
        ratings: {
          where: { status: "active" },
          orderBy: { createdAt: "desc" },
          take: 10
        },
        Assignment: {
          include: {
            Booking: true,
            JobEvent: {
              orderBy: { createdAt: "desc" }
            }
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    // Calculate performance metrics if not already calculated
    let performance = driver.performance;
    
    if (!performance) {
      // Create performance record if it doesn't exist
      performance = await prisma.driverPerformance.create({
        data: {
          driverId: driver.id,
          averageRating: 0,
          totalRatings: 0,
          completionRate: 0,
          acceptanceRate: 0,
          onTimeRate: 0,
          cancellationRate: 0,
          totalJobs: 0,
          completedJobs: 0,
          cancelledJobs: 0,
          lateJobs: 0
        }
      });
    }

    // Calculate current metrics
    const allAssignments = driver.Assignment;
    const completedAssignments = allAssignments.filter(a => a.status === "completed");
    const cancelledAssignments = allAssignments.filter(a => a.status === "cancelled");
    const offeredAssignments = allAssignments.filter(a => a.status === "invited");
    const claimedAssignments = allAssignments.filter(a => a.status === "claimed");

    // Calculate completion rate (completed / claimed)
    const completionRate = claimedAssignments.length > 0 
      ? (completedAssignments.length / claimedAssignments.length) * 100 
      : 0;

    // Calculate acceptance rate (claimed / offered)
    const acceptanceRate = offeredAssignments.length > 0 
      ? (claimedAssignments.length / offeredAssignments.length) * 100 
      : 0;

    // Calculate cancellation rate (cancelled / total)
    const cancellationRate = allAssignments.length > 0 
      ? (cancelledAssignments.length / allAssignments.length) * 100 
      : 0;

    // Calculate average rating
    const averageRating = driver.rating || 0;

    // Calculate on-time rate (simplified - would need more complex logic based on job events)
    const onTimeRate = completedAssignments.length > 0 ? 95 : 0; // Placeholder

    // Update performance record
    const updatedPerformance = await prisma.driverPerformance.update({
      where: { id: performance.id },
      data: {
        averageRating,
        totalRatings: 1, // Simplified for now
        completionRate,
        acceptanceRate,
        onTimeRate,
        cancellationRate,
        totalJobs: allAssignments.length,
        completedJobs: completedAssignments.length,
        cancelledJobs: cancelledAssignments.length,
        lastCalculated: new Date()
      }
    });

    // Get recent ratings with assignment details
    const recentRatings = await prisma.driverRating.findMany({
      where: {
        driverId: driver.id,
        status: "active"
      },
      include: {
        Assignment: {
          include: {
            Booking: {
              select: {
                reference: true,
                pickupAddress: true,
                dropoffAddress: true,
                scheduledAt: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 10
    });

    // Get recent incidents
    const recentIncidents = await prisma.driverIncident.findMany({
      where: {
        driverId: driver.id
      },
      include: {
        Assignment: {
          include: {
            Booking: {
              select: {
                reference: true,
                pickupAddress: true,
                dropoffAddress: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 5
    });

    // Calculate monthly metrics (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyAssignments = allAssignments.filter(a => 
      a.createdAt >= thirtyDaysAgo
    );
    const monthlyCompleted = monthlyAssignments.filter(a => a.status === "completed");
    const monthlyRating = averageRating; // Simplified for now
    const monthlyCompletionRate = monthlyAssignments.length > 0 
      ? (monthlyCompleted.length / monthlyAssignments.length) * 100 
      : 0;

    return NextResponse.json({
      performance: {
        averageRating: updatedPerformance.averageRating,
        totalRatings: updatedPerformance.totalRatings,
        completionRate: updatedPerformance.completionRate,
        acceptanceRate: updatedPerformance.acceptanceRate,
        onTimeRate: updatedPerformance.onTimeRate,
        cancellationRate: updatedPerformance.cancellationRate,
        totalJobs: updatedPerformance.totalJobs,
        completedJobs: updatedPerformance.completedJobs,
        cancelledJobs: updatedPerformance.cancelledJobs,
        lastCalculated: updatedPerformance.lastCalculated
      },
      monthly: {
        rating: monthlyRating,
        completionRate: monthlyCompletionRate,
        jobsCompleted: monthlyCompleted.length,
        totalJobs: monthlyAssignments.length
      },
      recentRatings: recentRatings.map(rating => ({
        id: rating.id,
        rating: rating.rating,
        review: rating.review,
        category: rating.category,
        createdAt: rating.createdAt,
        job: rating.Assignment ? {
          reference: rating.Assignment.Booking.reference,
          pickupAddress: rating.Assignment.Booking.pickupAddress,
          dropoffAddress: rating.Assignment.Booking.dropoffAddress,
          date: rating.Assignment.Booking.scheduledAt
        } : null
      })),
      recentIncidents: recentIncidents.map(incident => ({
        id: incident.id,
        type: incident.type,
        severity: incident.severity,
        title: incident.title,
        status: incident.status,
        reportedAt: incident.reportedAt,
        job: incident.Assignment ? {
          reference: incident.Assignment.Booking.reference,
          pickupAddress: incident.Assignment.Booking.pickupAddress,
          dropoffAddress: incident.Assignment.Booking.dropoffAddress
        } : null
      }))
    });

  } catch (error) {
    console.error("Performance API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
