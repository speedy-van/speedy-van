import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reason } = await request.json();
    const applicationId = params.id;

    // Get driver application with current status
    const application = await prisma.driverApplication.findUnique({
      where: { id: applicationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    if (!application) {
      return NextResponse.json({ error: "Driver application not found" }, { status: 404 });
    }

    if (application.status !== 'pending') {
      return NextResponse.json(
        { error: "Driver application is not in pending status" },
        { status: 400 }
      );
    }

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Update application status
      const updatedApplication = await tx.driverApplication.update({
        where: { id: applicationId },
        data: {
          status: 'approved',
          reviewedAt: new Date(),
          reviewedBy: session.user.id,
          reviewNotes: reason || 'Approved by admin',
        }
      });

      // If user exists, activate their account and update role to driver
      if (application.user) {
        await tx.user.update({
          where: { id: application.user.id },
          data: {
            isActive: true,
            role: 'driver', // Ensure user has driver role
          }
        });

        // Check if driver record already exists
        const existingDriver = await tx.driver.findUnique({
          where: { userId: application.user.id }
        });

        // Create driver record if it doesn't exist
        if (!existingDriver) {
          const driver = await tx.driver.create({
            data: {
              userId: application.user.id,
              onboardingStatus: 'approved',
              basePostcode: application.postcode,
              vehicleType: 'medium_van', // Default value
              status: 'active',
              approvedAt: new Date(),
            }
          });

          // Create driver profile with personal information
          await tx.driverProfile.create({
            data: {
              driverId: driver.id,
              phone: application.phone,
              address: `${application.addressLine1}${application.addressLine2 ? `, ${application.addressLine2}` : ''}, ${application.city}, ${application.postcode}`,
              dob: application.dateOfBirth,
            }
          });

          // Create driver vehicle information
          await tx.driverVehicle.create({
            data: {
              driverId: driver.id,
              make: 'Unknown', // Default value since not in application
              model: 'Unknown', // Default value since not in application
              reg: 'Unknown', // Default value since not in application
            }
          });

          // Create driver checks with insurance and license information
          await tx.driverChecks.create({
            data: {
              driverId: driver.id,
              insurancePolicyNo: application.insurancePolicyNumber,
              insurer: application.insuranceProvider,
              policyEnd: application.insuranceExpiry,
              licenceExpiry: application.drivingLicenseExpiry,
              fileIds: [], // Empty array for now
            }
          });
        }
      }

      return updatedApplication;
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        actorRole: 'admin',
        action: 'driver_application_approved',
        targetType: 'DriverApplication',
        targetId: applicationId,
        after: {
          previousStatus: application.status,
          newStatus: 'approved',
          reason: reason || 'Approved by admin',
          approvedBy: session.user.email,
          approvedAt: new Date().toISOString(),
          driverRecordCreated: true,
        },
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    });

    // Send notification to driver (if notification system is implemented)
    // await sendDriverNotification(application.userId, 'application_approved', {
    //   driverName: application.user?.name || `${application.firstName} ${application.lastName}`,
    //   approvedAt: new Date().toISOString(),
    // });

    return NextResponse.json({
      success: true,
      message: "Driver application approved successfully. Driver record created.",
      application: {
        id: result.id,
        name: application.user?.name || `${application.firstName} ${application.lastName}`,
        email: application.email,
        status: 'approved',
        approvedAt: new Date().toISOString(),
        driverRecordCreated: true,
      }
    });

  } catch (error) {
    console.error("Driver application approval error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
