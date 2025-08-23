import { NextResponse } from "next/server";
import { requireDriver } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireDriver();
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const jobId = params.id;

  try {
    // Get driver data
    const driver = await prisma.driver.findUnique({
      where: { userId }
    });

    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    // Use a transaction to handle the acceptance
    const result = await prisma.$transaction(async (tx) => {
      // Find the assignment for this job and driver
      const assignment = await tx.assignment.findFirst({
        where: {
          bookingId: jobId,
          driverId: driver.id,
          status: "claimed"
        }
      });

      if (!assignment) {
        throw new Error("No claimed assignment found for this job");
      }

      // Check if assignment has expired
      if (assignment.expiresAt && assignment.expiresAt < new Date()) {
        throw new Error("Assignment has expired");
      }

      // Update assignment status to accepted (active job)
      const updatedAssignment = await tx.assignment.update({
        where: { id: assignment.id },
        data: {
          status: "accepted",
          expiresAt: null // Remove expiry since it's now active
        }
      });

      // Update booking status
      await tx.booking.update({
        where: { id: jobId },
        data: {
          status: "CONFIRMED"
        }
      });

      return updatedAssignment;
    });

    return NextResponse.json({
      success: true,
      message: "Job accepted successfully"
    });

  } catch (error: any) {
    console.error("Job accept API error:", error);
    
    if (error.message === "No claimed assignment found for this job") {
      return NextResponse.json({ error: "No claimed assignment found for this job" }, { status: 404 });
    }
    
    if (error.message === "Assignment has expired") {
      return NextResponse.json({ error: "Assignment has expired" }, { status: 409 });
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
