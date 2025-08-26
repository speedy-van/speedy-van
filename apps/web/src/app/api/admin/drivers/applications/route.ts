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

    // Build where clause for DriverApplication table
    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get driver applications with all related data
    const applications = await prisma.driverApplication.findMany({
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
      },
      orderBy: { applicationDate: 'desc' },
      skip: offset,
      take: limit,
    });

    // Transform data and calculate scores
    const transformedApplications = applications.map(app => {
      // Calculate score based on application completeness
      let score = 0;
      
      // Basic information completeness (30 points)
      if (app.firstName && app.lastName) score += 10;
      if (app.phone) score += 5;
      if (app.dateOfBirth) score += 5;
      if (app.nationalInsuranceNumber) score += 10;
      
      // Address completeness (20 points)
      if (app.addressLine1 && app.city && app.postcode) score += 20;
      
      // Driving information completeness (25 points)
      if (app.drivingLicenseNumber && app.drivingLicenseExpiry) score += 15;
      if (app.drivingLicenseFrontImage || app.drivingLicenseBackImage) score += 10;
      
      // Insurance information completeness (15 points)
      if (app.insuranceProvider && app.insurancePolicyNumber && app.insuranceExpiry) score += 15;
      
      // Banking information completeness (10 points)
      if (app.bankName && app.sortCode && app.accountNumber) score += 10;
      
      // Right to work completeness (10 points)
      if (app.rightToWorkShareCode) score += 10;
      
      // Emergency contact completeness (10 points)
      if (app.emergencyContactName && app.emergencyContactPhone) score += 10;
      
      // Document status mapping
      const documentStatus = {
        license: { 
          status: app.drivingLicenseFrontImage && app.drivingLicenseBackImage ? 'complete' : 'incomplete', 
          url: app.drivingLicenseFrontImage, 
          ocrData: null 
        },
        insurance: { 
          status: app.insuranceDocument ? 'complete' : 'incomplete', 
          url: app.insuranceDocument, 
          ocrData: null 
        },
        rightToWork: { 
          status: app.rightToWorkDocument ? 'complete' : 'incomplete', 
          url: app.rightToWorkDocument, 
          ocrData: null 
        },
        vehicleRegistration: { 
          status: 'incomplete', // Not collected in current form
          url: null, 
          ocrData: null 
        },
        dbs: { 
          status: 'incomplete', // Not collected in current form
          url: null, 
          ocrData: null 
        },
      };

      // Check for compliance issues
      const complianceIssues = [];
      
      if (app.drivingLicenseExpiry && new Date(app.drivingLicenseExpiry) < new Date()) {
        complianceIssues.push('License expired');
      }
      
      if (app.insuranceExpiry && new Date(app.insuranceExpiry) < new Date()) {
        complianceIssues.push('Insurance expired');
      }

      // Auto-approve eligibility
      const autoApproveEligible = score >= 85 && 
        Object.values(documentStatus).every(doc => doc.status === 'complete') &&
        complianceIssues.length === 0;

      return {
        id: app.id,
        name: `${app.firstName} ${app.lastName}`,
        email: app.email,
        phone: app.phone,
        score: Math.min(100, score),
        status: app.status,
        documents: documentStatus,
        vehicle: {
          type: 'Not specified',
          make: 'Not specified',
          model: 'Not specified',
          year: 'Not specified',
          reg: 'Not specified',
        },
        experience: '0 years',
        rating: 0,
        appliedAt: app.applicationDate.toISOString(),
        basePostcode: app.postcode,
        rightToWorkType: 'Not specified',
        complianceIssues,
        autoApproveEligible,
        // Include approval tracking fields
        approvedAt: app.reviewedAt && app.status === 'approved' ? app.reviewedAt.toISOString() : undefined,
        approvedBy: app.reviewedBy && app.status === 'approved' ? app.reviewedBy : undefined,
        reviewedAt: app.reviewedAt ? app.reviewedAt.toISOString() : undefined,
        reviewedBy: app.reviewedBy,
        reviewNotes: app.reviewNotes,
      };
    });

    return NextResponse.json({
      applications: transformedApplications,
      pagination: {
        page,
        limit,
        total: transformedApplications.length,
        pages: Math.ceil(transformedApplications.length / limit),
      }
    });

  } catch (error) {
    console.error("Admin driver applications GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
