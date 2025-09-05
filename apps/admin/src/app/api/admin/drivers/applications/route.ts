import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
        { nationalInsuranceNumber: { contains: search, mode: 'insensitive' } },
        { drivingLicenseNumber: { contains: search, mode: 'insensitive' } },
        { postcode: { contains: search, mode: 'insensitive' } },
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
          },
        },
      },
      orderBy: { applicationDate: 'desc' },
      skip: offset,
      take: limit,
    });

    // Get total count for pagination
    const totalCount = await prisma.driverApplication.count({ where });

    // Transform data and calculate comprehensive scores
    const transformedApplications = applications.map(app => {
      // Calculate comprehensive score based on application completeness
      let score = 0;
      let maxScore = 100;

      // Personal information completeness (25 points)
      if (app.firstName && app.lastName) score += 10;
      if (app.phone) score += 5;
      if (app.dateOfBirth) score += 5;
      if (app.nationalInsuranceNumber) score += 5;

      // Address completeness (20 points)
      if (app.addressLine1 && app.city && app.postcode) score += 15;
      if (app.addressLine2) score += 2;
      if (app.county) score += 3;

      // Driving information completeness (25 points)
      if (app.drivingLicenseNumber && app.drivingLicenseExpiry) score += 15;
      if (app.drivingLicenseFrontImage) score += 5;
      if (app.drivingLicenseBackImage) score += 5;

      // Insurance information completeness (15 points)
      if (
        app.insuranceProvider &&
        app.insurancePolicyNumber &&
        app.insuranceExpiry
      )
        score += 10;
      if (app.insuranceDocument) score += 5;

      // Banking information completeness (10 points)
      if (app.bankName && app.sortCode && app.accountNumber) score += 8;
      if (app.accountHolderName) score += 2;

      // Right to work completeness (10 points)
      if (app.rightToWorkShareCode) score += 7;
      if (app.rightToWorkDocument) score += 3;

      // Emergency contact completeness (10 points)
      if (app.emergencyContactName && app.emergencyContactPhone) score += 8;
      if (app.emergencyContactRelationship) score += 2;

      // Terms agreement completeness (5 points)
      if (
        app.agreeToTerms &&
        app.agreeToDataProcessing &&
        app.agreeToBackgroundCheck
      )
        score += 5;

      // Document status mapping with detailed information
      const documentStatus = {
        license: {
          status:
            app.drivingLicenseFrontImage && app.drivingLicenseBackImage
              ? 'complete'
              : 'incomplete',
          url: app.drivingLicenseFrontImage,
          backUrl: app.drivingLicenseBackImage,
          ocrData: null,
          details: {
            number: app.drivingLicenseNumber,
            expiry: app.drivingLicenseExpiry,
            frontImage: app.drivingLicenseFrontImage,
            backImage: app.drivingLicenseBackImage,
          },
        },
        insurance: {
          status: app.insuranceDocument ? 'complete' : 'incomplete',
          url: app.insuranceDocument,
          ocrData: null,
          details: {
            provider: app.insuranceProvider,
            policyNumber: app.insurancePolicyNumber,
            expiry: app.insuranceExpiry,
            document: app.insuranceDocument,
          },
        },
        rightToWork: {
          status: app.rightToWorkDocument ? 'complete' : 'incomplete',
          url: app.rightToWorkDocument,
          ocrData: null,
          details: {
            shareCode: app.rightToWorkShareCode,
            document: app.rightToWorkDocument,
          },
        },
        vehicleRegistration: {
          status: 'not_required', // Not collected in current form
          url: null,
          ocrData: null,
          details: null,
        },
        dbs: {
          status: 'not_required', // Not collected in current form
          url: null,
          ocrData: null,
          details: null,
        },
      };

      // Check for compliance issues and warnings
      const complianceIssues = [];
      const complianceWarnings = [];

      if (
        app.drivingLicenseExpiry &&
        new Date(app.drivingLicenseExpiry) < new Date()
      ) {
        complianceIssues.push('License expired');
      } else if (
        app.drivingLicenseExpiry &&
        new Date(app.drivingLicenseExpiry) <
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ) {
        complianceWarnings.push('License expiring within 30 days');
      }

      if (app.insuranceExpiry && new Date(app.insuranceExpiry) < new Date()) {
        complianceIssues.push('Insurance expired');
      } else if (
        app.insuranceExpiry &&
        new Date(app.insuranceExpiry) <
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ) {
        complianceWarnings.push('Insurance expiring within 30 days');
      }

      // Auto-approve eligibility with stricter criteria
      const autoApproveEligible =
        score >= 90 &&
        Object.values(documentStatus)
          .filter(doc => doc.status !== 'not_required')
          .every(doc => doc.status === 'complete') &&
        complianceIssues.length === 0 &&
        complianceWarnings.length === 0;

      // Calculate application age
      const applicationAge = Math.floor(
        (Date.now() - app.applicationDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        id: app.id,
        name: `${app.firstName} ${app.lastName}`,
        email: app.email,
        phone: app.phone,
        dateOfBirth: app.dateOfBirth,
        nationalInsuranceNumber: app.nationalInsuranceNumber,
        score: Math.min(100, score),
        maxScore,
        scorePercentage: Math.round((score / maxScore) * 100),
        status: app.status,
        documents: documentStatus,

        // Comprehensive address information
        address: {
          line1: app.addressLine1,
          line2: app.addressLine2,
          city: app.city,
          postcode: app.postcode,
          county: app.county,
          fullAddress: [
            app.addressLine1,
            app.addressLine2,
            app.city,
            app.postcode,
            app.county,
          ]
            .filter(Boolean)
            .join(', '),
        },

        // Comprehensive driving information
        driving: {
          licenseNumber: app.drivingLicenseNumber,
          licenseExpiry: app.drivingLicenseExpiry,
          licenseFrontImage: app.drivingLicenseFrontImage,
          licenseBackImage: app.drivingLicenseBackImage,
        },

        // Comprehensive insurance information
        insurance: {
          provider: app.insuranceProvider,
          policyNumber: app.insurancePolicyNumber,
          expiry: app.insuranceExpiry,
          document: app.insuranceDocument,
        },

        // Comprehensive banking information
        banking: {
          bankName: app.bankName,
          accountHolderName: app.accountHolderName,
          sortCode: app.sortCode,
          accountNumber: app.accountNumber,
        },

        // Right to work information
        rightToWork: {
          shareCode: app.rightToWorkShareCode,
          document: app.rightToWorkDocument,
        },

        // Emergency contact information
        emergencyContact: {
          name: app.emergencyContactName,
          phone: app.emergencyContactPhone,
          relationship: app.emergencyContactRelationship,
        },

        // Terms agreement status
        terms: {
          agreeToTerms: app.agreeToTerms,
          agreeToDataProcessing: app.agreeToDataProcessing,
          agreeToBackgroundCheck: app.agreeToBackgroundCheck,
        },

        // Vehicle information (placeholder for future enhancement)
        vehicle: {
          type: 'Not specified',
          make: 'Not specified',
          model: 'Not specified',
          year: 'Not specified',
          reg: 'Not specified',
        },
        experience: '0 years',
        rating: 0,

        // Application metadata
        appliedAt: app.applicationDate.toISOString(),
        applicationAge,
        basePostcode: app.postcode,
        rightToWorkType: 'Not specified',

        // Compliance information
        complianceIssues,
        complianceWarnings,
        autoApproveEligible,

        // Approval tracking fields
        approvedAt:
          app.reviewedAt && app.status === 'approved'
            ? app.reviewedAt.toISOString()
            : undefined,
        approvedBy:
          app.reviewedBy && app.status === 'approved'
            ? app.reviewedBy
            : undefined,
        reviewedAt: app.reviewedAt ? app.reviewedAt.toISOString() : undefined,
        reviewedBy: app.reviewedBy,
        reviewNotes: app.reviewNotes,

        // User relationship
        userId: app.userId,
        user: app.user,
      };
    });

    return NextResponse.json({
      applications: transformedApplications,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Admin driver applications GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
