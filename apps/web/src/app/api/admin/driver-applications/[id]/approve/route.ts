import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { unifiedEmailService } from '@/lib/email/UnifiedEmailService';
import { randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const applicationId = params.id;
    const adminUserId = (session.user as any).id;

    // Get the application
    const application = await prisma.driverApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    if (application.status !== 'pending' && application.status !== 'under_review') {
      return NextResponse.json(
        { 
          error: 'Application cannot be approved',
          details: `Application status is ${application.status}. Only pending or under_review applications can be approved.`
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: application.email },
    });

    let userId: string;
    let user;

    if (existingUser) {
      // User exists, check if they're already a driver
      const existingDriver = await prisma.driver.findUnique({
        where: { userId: existingUser.id },
      });

      if (existingDriver) {
        return NextResponse.json(
          { 
            error: 'User is already a driver',
            details: 'This email is already registered as a driver'
          },
          { status: 409 }
        );
      }

      userId = existingUser.id;
      user = existingUser;
    } else {
      // Create new user
      const tempPassword = randomBytes(8).toString('hex');
      user = await prisma.user.create({
        data: {
          email: application.email,
          name: application.fullName,
          role: 'driver',
          password: tempPassword, // Add the missing password field
          // Note: In production, you'd send a proper password reset email
          // For now, we'll use a temporary password
        },
      });
      userId = user.id;

      console.log('👤 New user created for driver application:', {
        userId: user.id,
        email: user.email,
        tempPassword, // In production, send this via email
      });
    }

    // Create driver record
    const driver = await prisma.driver.create({
      data: {
        userId: userId,
        status: 'active',
        onboardingStatus: 'approved',
        approvedAt: new Date(),
        // Bank account details will be handled separately
        // bankAccountName: (application.bankAccount as any)?.accountName || null,
        // bankAccountNumber: (application.bankAccount as any)?.accountNumber || null,
        // bankSortCode: (application.bankAccount as any)?.sortCode || null,
        // bankName: (application.bankAccount as any)?.bankName || null,
        // taxInfo removed - not in schema
      },
    });

    // Create driver availability record
    await prisma.driverAvailability.create({
      data: {
        driverId: driver.id,
        status: 'offline',
        locationConsent: false,
      },
    });

    // Create driver performance record
    await prisma.driverPerformance.create({
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
        lateJobs: 0,
      },
    });

    // Create driver notification preferences
    await prisma.driverNotificationPreferences.create({
      data: {
        driverId: driver.id,
        pushJobOffers: true,
        pushJobUpdates: true,
        emailJobOffers: true,
        emailJobUpdates: true,
        smsJobOffers: false,
        smsJobUpdates: false,
      },
    });

    // Create vehicle record if vehicle info exists
    // Vehicle info handling removed - not in schema
    if (false) {
      // const vehicleInfo = application.vehicleInfo as any;
      await prisma.driverVehicle.create({
        data: {
          driverId: driver.id,
          make: 'Unknown', // Default values since vehicleInfo is not available
          model: 'Unknown',
          reg: 'UNKNOWN',
          weightClass: 'VAN',
        },
      });
    }

    // Update application status
    await prisma.driverApplication.update({
      where: { id: applicationId },
      data: {
        status: 'approved',
        reviewedBy: adminUserId,
        reviewedAt: new Date(),
      },
    });

    // Create driver notification
    await prisma.driverNotification.create({
      data: {
        driverId: driver.id,
        type: 'job_offer',
        title: 'Welcome to Speedy Van! 🎉',
        message: 'Your driver application has been approved. You can now start accepting jobs and earning money!',
        read: false,
      },
    });

    console.log('✅ Driver application approved:', {
      applicationId,
      driverId: driver.id,
      userId: user.id,
      email: application.email,
      fullName: (application as any).fullName,
      approvedBy: adminUserId,
    });

    // Send approval email
    try {
      const emailResult = await unifiedEmailService.sendDriverApplicationStatus({
        driverEmail: application.email,
        driverName: application.fullName,
        applicationId: application.id,
        status: 'approved',
        reviewedAt: new Date().toISOString(),
        nextSteps: [
          'You will receive separate login credentials via email',
          'Log in to the driver portal to start working',
          'Download the Speedy Van driver app for easy job management',
          'Begin accepting jobs and earning money immediately',
        ],
      });

      if (emailResult.success) {
        console.log('✅ Driver application approval email sent:', {
          applicationId: application.id,
          email: application.email,
          messageId: emailResult.messageId,
          provider: emailResult.provider,
        });
      } else {
        console.warn('⚠️ Failed to send driver application approval email:', {
          applicationId: application.id,
          email: application.email,
          error: emailResult.error,
        });
      }
    } catch (emailError) {
      console.error('❌ Error sending driver application approval email:', emailError);
      // Don't fail the approval if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Driver application approved successfully',
      data: {
        applicationId,
        driverId: driver.id,
        userId: user.id,
        email: application.email,
        fullName: application.fullName,
        status: 'approved',
        nextSteps: [
          'Driver account has been created',
          'Driver can now log in to the driver portal',
          'Driver will receive welcome notification',
          'Driver can start accepting jobs immediately',
        ],
      },
    });

  } catch (error) {
    console.error('❌ Error approving driver application:', error);
    return NextResponse.json(
      {
        error: 'Failed to approve application',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
