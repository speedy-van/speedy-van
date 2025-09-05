import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId, driverId }: { jobId: string; driverId: string } =
      await request.json();

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // If driverId is 'auto', find the best available driver
    let finalDriverId: string = driverId;
    if (driverId === 'auto') {
      const job = await prisma.booking.findUnique({
        where: { id: jobId },
        include: {
          driver: true,
        },
      });

      if (!job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }

      // Find available drivers within radius (simplified logic)
      const availableDrivers = await prisma.driver.findMany({
        where: {
          status: 'active',
          onboardingStatus: 'approved',
          availability: {
            status: 'online',
          },
        },
        include: {
          user: true,
          availability: true,
          Booking: {
            where: {
              status: {
                in: ['CONFIRMED'],
              },
            },
          },
        },
      });

      // Filter drivers by capacity and rating
      const eligibleDrivers = availableDrivers.filter(driver => {
        const activeJobs = driver.Booking.length;
        const rating = driver.rating || 0;
        return activeJobs < 3 && rating >= 4.0; // Basic filtering
      });

      if (eligibleDrivers.length === 0) {
        return NextResponse.json(
          {
            error: 'No eligible drivers available for auto-assignment',
          },
          { status: 400 }
        );
      }

      // Select the first eligible driver (in a real app, you'd use more sophisticated logic)
      finalDriverId = eligibleDrivers[0].id;
    }

    // Check if driver exists and is available
    const driver = await prisma.driver.findUnique({
      where: { id: finalDriverId },
      include: {
        availability: true,
      },
    });

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    if (driver.onboardingStatus !== 'approved') {
      return NextResponse.json(
        { error: 'Driver is not approved' },
        { status: 400 }
      );
    }

    // Check if job is already assigned
    const existingJob = await prisma.booking.findUnique({
      where: { id: jobId },
      include: {
        driver: true,
      },
    });

    if (!existingJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (existingJob.driverId) {
      return NextResponse.json(
        { error: 'Job is already assigned' },
        { status: 400 }
      );
    }

    // Assign the job to the driver
    const updatedJob = await prisma.booking.update({
      where: { id: jobId },
      data: {
        driverId: finalDriverId,
        status: 'CONFIRMED',
      },
      include: {
        driver: {
          include: {
            user: true,
          },
        },
        customer: true,
      },
    });

    // Create assignment record
    await prisma.assignment.create({
      data: {
        id: `assignment_${jobId}_${finalDriverId}`,
        bookingId: jobId,
        driverId: finalDriverId,
        status: 'invited',
        updatedAt: new Date(),
      },
    });

    // Log the assignment for audit
    await prisma.auditLog.create({
      data: {
        actorId: (session.user as any).id,
        actorRole: (session.user as any).role || 'admin',
        action: 'job_assigned',
        targetType: 'booking',
        targetId: jobId,
        before: undefined,
        after: {
          driverId: finalDriverId,
          status: 'CONFIRMED',
        },
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Job assigned successfully',
      data: {
        jobId,
        driverId: finalDriverId,
        driverName: updatedJob.driver?.user.name,
      },
    });
  } catch (error) {
    console.error('Dispatch assignment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
