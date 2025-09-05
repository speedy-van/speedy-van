import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Driver application not found' },
        { status: 404 }
      );
    }

    if (application.status !== 'pending') {
      return NextResponse.json(
        { error: 'Driver application is not in pending status' },
        { status: 400 }
      );
    }

    // Update application status
    await prisma.driverApplication.update({
      where: { id: applicationId },
      data: {
        status: 'rejected',
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
        reviewNotes: reason || 'Rejected by admin',
      },
    });

    // If user exists, deactivate their account
    if (application.user) {
      await prisma.user.update({
        where: { id: application.user.id },
        data: {
          isActive: false,
        },
      });
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        actorRole: 'admin',
        action: 'driver_application_rejected',
        targetType: 'DriverApplication',
        targetId: applicationId,
        after: {
          previousStatus: application.status,
          newStatus: 'rejected',
          reason: reason || 'Rejected by admin',
          rejectedBy: session.user.email,
          rejectedAt: new Date().toISOString(),
        },
        ip:
          request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip') ||
          'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    // Send notification to driver (if notification system is implemented)
    // await sendDriverNotification(application.userId, 'application_rejected', {
    //   driverName: application.user?.name || `${application.firstName} ${application.lastName}`,
    //   reason: reason || 'Rejected by admin',
    //   rejectedAt: new Date().toISOString(),
    // });

    return NextResponse.json({
      success: true,
      message: 'Driver application rejected successfully',
      application: {
        id: application.id,
        name:
          application.user?.name ||
          `${application.firstName} ${application.lastName}`,
        email: application.email,
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        reason: reason || 'Rejected by admin',
      },
    });
  } catch (error) {
    console.error('Driver application rejection error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
