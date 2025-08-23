import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Get drivers with all related data
    const drivers = await prisma.driver.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          }
        },
        profile: {
          select: {
            phone: true,
            address: true,
            dob: true,
          }
        },
        vehicles: {
          select: {
            id: true,
            make: true,
            model: true,
            reg: true,
            weightClass: true,
            motExpiry: true,
          }
        },
        checks: {
          select: {
            rtwMethod: true,
            rtwExpiresAt: true,
            licenceCategories: true,
            points: true,
            licenceExpiry: true,
            dbsType: true,
            dbsCheckedAt: true,
            insurancePolicyNo: true,
            insurer: true,
            policyEnd: true,
          }
        },
        ratings: {
          select: {
            rating: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        Booking: {
          select: {
            id: true,
            status: true,
            totalGBP: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 100,
        },
        availability: {
          select: {
            status: true,
            lastSeenAt: true,
            lastLat: true,
            lastLng: true,
          }
        },
        performance: {
          select: {
            acceptanceRate: true,
            completionRate: true,
            onTimeRate: true,
            averageRating: true,
            totalJobs: true,
            completedJobs: true,
            lateJobs: true,
            totalRatings: true,
          }
        },
        incidents: {
          select: {
            id: true,
            type: true,
            severity: true,
            description: true,
            createdAt: true,
            status: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });

    // Transform data and calculate metrics
    const transformedDrivers = drivers.map(driver => {
      // Calculate average rating
      const avgRating = driver.ratings?.length > 0 
        ? driver.ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / driver.ratings.length
        : 0;

      // Calculate job metrics
      const totalJobs = driver.Booking?.length || 0;
      const completedJobs = driver.Booking?.filter(b => b.status === 'COMPLETED').length || 0;
      const onTimeJobs = driver.Booking?.filter(b => b.status === 'COMPLETED').length || 0; // Simplified - no completedAt field
      const totalEarnings = driver.Booking?.reduce((sum, b) => sum + (b.totalGBP || 0), 0) || 0;

      // Calculate performance metrics
      const acceptanceRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;
      const completionRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;
      const onTimeRate = completedJobs > 0 ? Math.round((onTimeJobs / completedJobs) * 100) : 0;

      // Check for compliance issues
      const complianceIssues = [];
      
      if (driver.checks?.licenceExpiry && new Date(driver.checks.licenceExpiry) < new Date()) {
        complianceIssues.push('License expired');
      }
      
      if (driver.checks?.rtwExpiresAt && new Date(driver.checks.rtwExpiresAt) < new Date()) {
        complianceIssues.push('Right to work expired');
      }
      
      if (driver.checks?.policyEnd && new Date(driver.checks.policyEnd) < new Date()) {
        complianceIssues.push('Insurance expired');
      }
      
      if (driver.vehicles[0]?.motExpiry && new Date(driver.vehicles[0].motExpiry) < new Date()) {
        complianceIssues.push('MOT expired');
      }
      
      if (driver.checks?.points && driver.checks.points > 6) {
        complianceIssues.push('Too many license points');
      }

      // Document expiries
      const documentExpiries = {
        license: driver.checks?.licenceExpiry?.toISOString() || null,
        insurance: driver.checks?.policyEnd?.toISOString() || null,
        mot: driver.vehicles[0]?.motExpiry?.toISOString() || null,
        rtw: driver.checks?.rtwExpiresAt?.toISOString() || null,
      };

      return {
        id: driver.id,
        name: driver.user.name || 'Unknown',
        email: driver.user.email,
        phone: driver.profile?.phone || 'Not provided',
        onboardingStatus: driver.onboardingStatus,
        status: driver.status,
        approvedAt: driver.approvedAt?.toISOString() || null,
        createdAt: driver.user.createdAt.toISOString(),
        updatedAt: driver.updatedAt.toISOString(),
        basePostcode: driver.basePostcode || 'Not provided',
        vehicleType: driver.vehicleType || 'Unknown',
        rating: avgRating,
        totalJobs,
        completedJobs,
        onTimeJobs,
        totalEarnings,
        availability: driver.availability?.status || 'offline',
        lastSeen: driver.availability?.lastSeenAt?.toISOString() || null,
        complianceIssues,
        documentExpiries,
        kpis: {
          acceptanceRate,
          completionRate,
          onTimeRate,
          avgRating,
        },
        incidents: driver.incidents.map(incident => ({
          id: incident.id,
          type: incident.type,
          severity: incident.severity,
          description: incident.description,
          createdAt: incident.createdAt.toISOString(),
          status: incident.status,
        })),
        performance: driver.performance || {
          acceptanceRate,
          completionRate,
          onTimeRate,
          averageRating: avgRating,
          totalJobs,
          completedJobs,
          lateJobs: 0,
          totalRatings: driver.ratings?.length || 0,
        },
      };
    });

    // Get total count for pagination
    const total = await prisma.driver.count({ where });

    return NextResponse.json({
      drivers: transformedDrivers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    });

  } catch (error) {
    console.error("Admin drivers GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
