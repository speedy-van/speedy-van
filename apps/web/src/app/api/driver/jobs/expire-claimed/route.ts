import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const now = new Date();
    
    // Find all claimed assignments that have expired
    const expiredAssignments = await prisma.assignment.findMany({
      where: {
        status: "claimed",
        expiresAt: {
          lt: now
        }
      },
      include: {
        Booking: true
      }
    });

    if (expiredAssignments.length === 0) {
      return NextResponse.json({
        message: "No expired assignments found",
        expiredCount: 0
      });
    }

    // Update expired assignments to declined status
    const updatePromises = expiredAssignments.map(async (assignment) => {
      await prisma.$transaction(async (tx) => {
        // Update assignment status to declined
        await tx.assignment.update({
          where: { id: assignment.id },
          data: { status: "declined" }
        });

        // Reset booking to make it available again
        await tx.booking.update({
          where: { id: assignment.bookingId },
          data: {
            driverId: null,
            status: "CONFIRMED"
          }
        });
      });
    });

    await Promise.all(updatePromises);

    return NextResponse.json({
      message: `Expired ${expiredAssignments.length} claimed assignments`,
      expiredCount: expiredAssignments.length,
      expiredAssignments: expiredAssignments.map(assignment => ({
        id: assignment.id,
        bookingId: assignment.bookingId,
        driverId: assignment.driverId,
        expiresAt: assignment.expiresAt
      }))
    });

  } catch (error) {
    console.error("Error expiring claimed Assignment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
