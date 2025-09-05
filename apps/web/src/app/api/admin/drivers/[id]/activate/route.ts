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
    const driverId = params.id;

    // Get driver with current status
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
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

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    if (driver.status === 'active') {
      return NextResponse.json(
        { error: 'Driver is already active' },
        { status: 400 }
      );
    }

    // Update driver status
    await prisma.driver.update({
      where: { id: driverId },
      data: {
        status: 'active',
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        actorRole: 'admin',
        action: 'driver_activated',
        targetType: 'Driver',
        targetId: driverId,
        after: {
          previousStatus: driver.status,
          newStatus: 'active',
          reason: reason || 'Activated by admin',
          activatedBy: session.user.email,
          activatedAt: new Date().toISOString(),
        },
        ip:
          request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip') ||
          'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    // Send notification to driver (if notification system is implemented)
    // await sendDriverNotification(driver.userId, 'account_activated', {
    //   driverName: driver.user.name,
    //   activatedAt: new Date().toISOString(),
    // });

    return NextResponse.json({
      success: true,
      message: 'Driver activated successfully',
      driver: {
        id: driver.id,
        name: driver.user.name,
        email: driver.user.email,
        status: 'active',
        activatedAt: new Date().toISOString(),
        reason: reason || 'Activated by admin',
      },
    });
  } catch (error) {
    console.error('Driver activation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
