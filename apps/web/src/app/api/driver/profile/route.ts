import { NextRequest } from 'next/server';
import { withApiHandler, requireRole, httpJson } from '@/lib/api/guard';
import { parseJson } from '@/lib/validation/helpers';
import { driverProfileUpdateExtended } from '@/lib/validation/schemas';
import { logAudit } from '@/lib/audit';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, "driver");
  if (auth) return auth;

  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const driver = await prisma.driver.findUnique({
    where: { userId },
    include: {
      user: true,
      vehicles: true,
      checks: true,
      documents: {
        orderBy: { uploadedAt: 'desc' }
      }
    }
  });

  if (!driver) {
    return httpJson(404, { error: "Driver not found" });
  }

  return httpJson(200, {
    profile: {
      id: driver.id,
      name: driver.user.name,
      email: driver.user.email,
      status: driver.status,
      onboardingStatus: driver.onboardingStatus,
      basePostcode: driver.basePostcode,
      vehicleType: driver.vehicleType,
      approvedAt: driver.approvedAt,
      createdAt: driver.createdAt,
      updatedAt: driver.updatedAt,
    },
    vehicle: driver.vehicles[0] || null,
    checks: driver.checks,
    documents: driver.documents,
  });
});

export const PUT = withApiHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, "driver");
  if (auth) return auth;

  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const parsed = await parseJson(request, driverProfileUpdateExtended);
  if (!parsed.ok) return parsed.error;

  const formData = parsed.data;

  const driver = await prisma.driver.findUnique({
    where: { userId },
    include: { vehicles: true, checks: true }
  });

  if (!driver) {
    return httpJson(404, { error: "Driver not found" });
  }

  // Update user information
  if (formData.name) {
    await prisma.user.update({
      where: { id: userId },
      data: { name: formData.name }
    });
  }

  // Update driver profile
  const driverUpdateData: any = {};
  if (formData.basePostcode) driverUpdateData.basePostcode = formData.basePostcode;
  if (formData.vehicleType) driverUpdateData.vehicleType = formData.vehicleType;

  if (Object.keys(driverUpdateData).length > 0) {
    await prisma.driver.update({
      where: { id: driver.id },
      data: driverUpdateData
    });
  }

  // Update vehicle information
  if (formData.vehicle) {
    if (driver.vehicles.length > 0) {
      await prisma.driverVehicle.update({
        where: { id: driver.vehicles[0].id },
        data: {
          make: formData.vehicle.make,
          model: formData.vehicle.model,
          reg: formData.vehicle.reg,
          weightClass: formData.vehicle.weightClass,
          motExpiry: formData.vehicle.motExpiry ? new Date(formData.vehicle.motExpiry) : null,
        }
      });
    } else {
      await prisma.driverVehicle.create({
        data: {
          driverId: driver.id,
          make: formData.vehicle.make,
          model: formData.vehicle.model,
          reg: formData.vehicle.reg,
          weightClass: formData.vehicle.weightClass,
          motExpiry: formData.vehicle.motExpiry ? new Date(formData.vehicle.motExpiry) : null,
        }
      });
    }
  }

  // Update driver checks
  if (formData.checks) {
    if (driver.checks) {
      await prisma.driverChecks.update({
        where: { id: driver.checks.id },
        data: {
          rtwMethod: formData.checks.rtwMethod,
          rtwResultRef: formData.checks.rtwResultRef,
          rtwExpiresAt: formData.checks.rtwExpiresAt ? new Date(formData.checks.rtwExpiresAt) : null,
          dvlaCheckRef: formData.checks.dvlaCheckRef,
          licenceCategories: formData.checks.licenceCategories || [],
          points: formData.checks.points,
          licenceExpiry: formData.checks.licenceExpiry ? new Date(formData.checks.licenceExpiry) : null,
          dbsType: formData.checks.dbsType,
          dbsCheckRef: formData.checks.dbsCheckRef,
          dbsCheckedAt: formData.checks.dbsCheckedAt ? new Date(formData.checks.dbsCheckedAt) : null,
          dbsRetentionUntil: formData.checks.dbsRetentionUntil ? new Date(formData.checks.dbsRetentionUntil) : null,
          insurancePolicyNo: formData.checks.insurancePolicyNo,
          insurer: formData.checks.insurer,
          coverType: formData.checks.coverType,
          goodsInTransit: formData.checks.goodsInTransit,
          publicLiability: formData.checks.publicLiability,
          policyStart: formData.checks.policyStart ? new Date(formData.checks.policyStart) : null,
          policyEnd: formData.checks.policyEnd ? new Date(formData.checks.policyEnd) : null,
        }
      });
    } else {
      await prisma.driverChecks.create({
        data: {
          driverId: driver.id,
          rtwMethod: formData.checks.rtwMethod,
          rtwResultRef: formData.checks.rtwResultRef,
          rtwExpiresAt: formData.checks.rtwExpiresAt ? new Date(formData.checks.rtwExpiresAt) : null,
          dvlaCheckRef: formData.checks.dvlaCheckRef,
          licenceCategories: formData.checks.licenceCategories || [],
          points: formData.checks.points,
          licenceExpiry: formData.checks.licenceExpiry ? new Date(formData.checks.licenceExpiry) : null,
          dbsType: formData.checks.dbsType,
          dbsCheckRef: formData.checks.dbsCheckRef,
          dbsCheckedAt: formData.checks.dbsCheckedAt ? new Date(formData.checks.dbsCheckedAt) : null,
          dbsRetentionUntil: formData.checks.dbsRetentionUntil ? new Date(formData.checks.dbsRetentionUntil) : null,
          insurancePolicyNo: formData.checks.insurancePolicyNo,
          insurer: formData.checks.insurer,
          coverType: formData.checks.coverType,
          goodsInTransit: formData.checks.goodsInTransit,
          publicLiability: formData.checks.publicLiability,
          policyStart: formData.checks.policyStart ? new Date(formData.checks.policyStart) : null,
          policyEnd: formData.checks.policyEnd ? new Date(formData.checks.policyEnd) : null,
        }
      });
    }
  }

  // Log the profile update
  await logAudit({
    action: "driver_profile_updated",
    targetType: "driver",
    targetId: driver.id,
    before: null,
    after: formData
  });

  return httpJson(200, {
    success: true,
    message: "Profile updated successfully"
  });
});
