import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/admin/drivers/applications/[id] - Get driver application details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = params;

    // Get driver application with all details
    const application = await prisma.driverApplication.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Calculate comprehensive score
    let score = 0;
    let maxScore = 100;

    // Personal information completeness (25 points)
    if (application.firstName && application.lastName) score += 10;
    if (application.phone) score += 5;
    if (application.dateOfBirth) score += 5;
    if (application.nationalInsuranceNumber) score += 5;

    // Address completeness (20 points)
    if (application.addressLine1 && application.city && application.postcode) score += 15;
    if (application.addressLine2) score += 2;
    if (application.county) score += 3;

    // Driving information completeness (25 points)
    if (application.drivingLicenseNumber && application.drivingLicenseExpiry) score += 15;
    if (application.drivingLicenseFrontImage) score += 5;
    if (application.drivingLicenseBackImage) score += 5;

    // Insurance information completeness (15 points)
    if (
      application.insuranceProvider &&
      application.insurancePolicyNumber &&
      application.insuranceExpiry
    )
      score += 10;
    if (application.insuranceDocument) score += 5;

    // Banking information completeness (10 points)
    if (application.bankName && application.sortCode && application.accountNumber) score += 8;
    if (application.accountHolderName) score += 2;

    // Right to work completeness (5 points)
    if (application.rightToWorkShareCode) score += 3;
    if (application.rightToWorkDocument) score += 2;

    // Emergency contact completeness (5 points)
    if (application.emergencyContactName && application.emergencyContactPhone) score += 3;
    if (application.emergencyContactRelationship) score += 2;

    // Terms agreement completeness (5 points)
    if (
      application.agreeToTerms &&
      application.agreeToDataProcessing &&
      application.agreeToBackgroundCheck
    )
      score += 5;

    // Document status
    const documentStatus = {
      license: {
        status:
          application.drivingLicenseFrontImage && application.drivingLicenseBackImage
            ? 'complete'
            : 'incomplete',
        url: application.drivingLicenseFrontImage,
        backUrl: application.drivingLicenseBackImage,
      },
      insurance: {
        status: application.insuranceDocument ? 'complete' : 'incomplete',
        url: application.insuranceDocument,
      },
      rightToWork: {
        status: application.rightToWorkDocument ? 'complete' : 'incomplete',
        url: application.rightToWorkDocument,
      },
    };

    // Check for compliance issues
    const complianceIssues = [];
    const complianceWarnings = [];

    if (
      application.drivingLicenseExpiry &&
      new Date(application.drivingLicenseExpiry) < new Date()
    ) {
      complianceIssues.push('Driving license expired');
    } else if (
      application.drivingLicenseExpiry &&
      new Date(application.drivingLicenseExpiry) <
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    ) {
      complianceWarnings.push('Driving license expiring within 30 days');
    }

    if (application.insuranceExpiry && new Date(application.insuranceExpiry) < new Date()) {
      complianceIssues.push('Insurance expired');
    } else if (
      application.insuranceExpiry &&
      new Date(application.insuranceExpiry) <
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    ) {
      complianceWarnings.push('Insurance expiring within 30 days');
    }

    // Auto-approve eligibility
    const autoApproveEligible =
      score >= 90 &&
      Object.values(documentStatus).every(doc => doc.status === 'complete') &&
      complianceIssues.length === 0 &&
      complianceWarnings.length === 0;

    // Calculate application age
    const applicationAge = Math.floor(
      (Date.now() - application.applicationDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Transform response
    const transformedApplication = {
      id: application.id,
      name: `${application.firstName} ${application.lastName}`,
      email: application.email,
      phone: application.phone,
      dateOfBirth: application.dateOfBirth.toISOString(),
      nationalInsuranceNumber: application.nationalInsuranceNumber,
      score: Math.min(100, score),
      maxScore,
      scorePercentage: Math.round((score / maxScore) * 100),
      status: application.status,
      documents: documentStatus,

      // Address information
      address: {
        line1: application.addressLine1,
        line2: application.addressLine2,
        city: application.city,
        postcode: application.postcode,
        county: application.county,
        fullAddress: [
          application.addressLine1,
          application.addressLine2,
          application.city,
          application.postcode,
          application.county,
        ]
          .filter(Boolean)
          .join(', '),
      },

      // Driving information
      driving: {
        licenseNumber: application.drivingLicenseNumber,
        licenseExpiry: application.drivingLicenseExpiry.toISOString(),
        licenseFrontImage: application.drivingLicenseFrontImage,
        licenseBackImage: application.drivingLicenseBackImage,
      },

      // Insurance information
      insurance: {
        provider: application.insuranceProvider,
        policyNumber: application.insurancePolicyNumber,
        expiry: application.insuranceExpiry.toISOString(),
        document: application.insuranceDocument,
      },

      // Banking information
      banking: {
        bankName: application.bankName,
        accountHolderName: application.accountHolderName,
        sortCode: application.sortCode,
        accountNumber: application.accountNumber,
      },

      // Right to work information
      rightToWork: {
        shareCode: application.rightToWorkShareCode,
        document: application.rightToWorkDocument,
      },

      // Emergency contact
      emergencyContact: {
        name: application.emergencyContactName,
        phone: application.emergencyContactPhone,
        relationship: application.emergencyContactRelationship,
      },

      // Terms agreement
      terms: {
        agreeToTerms: application.agreeToTerms,
        agreeToDataProcessing: application.agreeToDataProcessing,
        agreeToBackgroundCheck: application.agreeToBackgroundCheck,
      },

      // Application metadata
      appliedAt: application.applicationDate.toISOString(),
      applicationAge,
      complianceIssues,
      complianceWarnings,
      autoApproveEligible,
      reviewedAt: application.reviewedAt?.toISOString(),
      reviewedBy: application.reviewedBy,
      reviewNotes: application.reviewNotes,

      // User relationship
      userId: application.userId,
      user: application.user,
    };

    return NextResponse.json(transformedApplication);
  } catch (error) {
    console.error('Admin driver application details GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/drivers/applications/[id] - Update driver application status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const user = authResult;

    const { id } = params;
    const body = await request.json();
    const { status, reviewNotes } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Update application
    const updatedApplication = await prisma.driverApplication.update({
      where: { id },
      data: {
        status,
        reviewNotes,
        reviewedAt: new Date(),
        reviewedBy: user.name || user.email,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // If approved, activate the user account
    if (status === 'approved' && updatedApplication.userId) {
      await prisma.user.update({
        where: { id: updatedApplication.userId },
        data: { isActive: true },
      });
    }

    // If rejected, deactivate the user account
    if (status === 'rejected' && updatedApplication.userId) {
      await prisma.user.update({
        where: { id: updatedApplication.userId },
        data: { isActive: false },
      });
    }

    return NextResponse.json({
      message: 'Application updated successfully',
      application: updatedApplication,
    });
  } catch (error) {
    console.error('Admin driver application update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
