import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Helper function to check if driver has active orders
async function hasActiveOrders(driverId: string): Promise<boolean> {
  const activeAssignments = await prisma.assignment.findMany({
    where: {
      driverId: driverId,
      status: {
        in: ['invited', 'claimed', 'accepted']
      }
    }
  });
  return activeAssignments.length > 0;
}

// GET /api/driver/profile - Get driver profile (simplified version)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('🚗 Driver Profile API - Session check:', {
      hasSession: !!session,
      userRole: (session?.user as any)?.role,
      userId: (session?.user as any)?.id,
      email: session?.user?.email,
    });

    if (!session?.user || (session.user as any).role !== 'driver') {
      console.log('❌ Driver Profile API - Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized - Driver access required' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    // Simple user lookup first
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Simple driver lookup with availability
    const driver = await prisma.driver.findUnique({
      where: { userId: userId },
      select: {
        id: true,
        basePostcode: true,
        vehicleType: true,
        onboardingStatus: true,
        rating: true,
        strikes: true,
        status: true,
        availability: {
          select: {
            status: true,
            locationConsent: true,
            lastSeenAt: true,
          },
        },
      },
    });

    if (!driver) {
      return NextResponse.json(
        { error: 'Driver record not found' },
        { status: 404 }
      );
    }

    // Simple driver application lookup
    let driverApplication = null;
    try {
      driverApplication = await prisma.driverApplication.findFirst({
        where: { userId: userId },
        select: {
          firstName: true,
          lastName: true,
          phone: true,
          status: true,
          applicationDate: true,
        },
      });
    } catch (error) {
      console.log('Warning: Could not fetch driver application:', error);
    }

    // Simple profile data (no complex joins)
    const profileData = {
      // Basic Info
      id: user.id,
      email: user.email,
      firstName: driverApplication?.firstName || '',
      lastName: driverApplication?.lastName || '',
      phone: driverApplication?.phone || '',
      
      // Driver Info
      driverId: driver.id,
      basePostcode: driver.basePostcode || '',
      vehicleType: driver.vehicleType || '',
      onboardingStatus: driver.onboardingStatus,
      rating: driver.rating || 0,
      strikes: driver.strikes || 0,
      status: driver.status,
      
      // Simple calculated fields
      bio: '',
      profileImage: '',
      profileCompleteness: 50, // Fixed value for now
      
      // Simple statistics (no complex queries)
      totalJobs: 0,
      averageScore: 0,
      averageRating: driver.rating || 0,
      completionRate: 0,
      onTimeRate: 0,
      
      // Driver availability - Default to online if no availability record exists
      isOnline: driver.availability?.status === 'online' || !driver.availability,
      lastSeenAt: driver.availability?.lastSeenAt?.toISOString() || null,
      locationConsent: driver.availability?.locationConsent || false,
      hasActiveOrders: await hasActiveOrders(driver.id),
      
      // Empty arrays for now
      recentRatings: [],
      
      // Account Info
      joinedAt: user.createdAt.toISOString(),
      lastLogin: user.lastLogin?.toISOString(),
      applicationStatus: driverApplication?.status || 'unknown',
      applicationDate: driverApplication?.applicationDate?.toISOString(),
    };

    console.log('✅ Driver profile data loaded (simplified):', {
      driverId: driver.id,
      profileCompleteness: profileData.profileCompleteness,
      totalJobs: profileData.totalJobs,
    });

    return NextResponse.json({
      success: true,
      data: profileData,
    });

  } catch (error) {
    console.error('❌ Error fetching driver profile:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch profile data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT /api/driver/profile - Update driver profile (simplified)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user as any).role !== 'driver') {
      return NextResponse.json(
        { error: 'Unauthorized - Driver access required' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const body = await request.json();

    // Simple updates only
    const { firstName, lastName, phone, email, basePostcode, vehicleType, locationConsent } = body;

    // Update user email if provided
    if (email) {
      await prisma.user.update({
        where: { id: userId },
        data: { email },
      });
    }

    // Update driver data if provided
    const driverUpdateData: any = {};
    if (basePostcode) driverUpdateData.basePostcode = basePostcode;
    if (vehicleType) driverUpdateData.vehicleType = vehicleType;

    if (Object.keys(driverUpdateData).length > 0) {
      await prisma.driver.update({
        where: { userId: userId },
        data: driverUpdateData,
      });
    }

    // Handle location consent updates
    if (locationConsent !== undefined) {
      // Get driver to check for active orders
      const driver = await prisma.driver.findUnique({
        where: { userId: userId },
        select: { id: true },
      });

      if (driver) {
        // Check if driver has active orders
        const driverHasActiveOrders = await hasActiveOrders(driver.id);
        
        // If trying to disable location sharing while having active orders, prevent it
        if (driverHasActiveOrders && !locationConsent) {
          return NextResponse.json(
            { 
              error: 'Cannot disable location sharing while you have active orders',
              activeOrders: true 
            },
            { status: 400 }
          );
        }

        // Update location consent in driver availability
        await prisma.driverAvailability.upsert({
          where: { driverId: driver.id },
          create: {
            driverId: driver.id,
            status: 'online',
            locationConsent: locationConsent,
          },
          update: {
            locationConsent: locationConsent,
          },
        });
      }
    }

    // Update driver application data if provided
    if (firstName || lastName || phone) {
      const applicationUpdateData: any = {};
      if (firstName) applicationUpdateData.firstName = firstName;
      if (lastName) applicationUpdateData.lastName = lastName;
      if (phone) applicationUpdateData.phone = phone;

      await prisma.driverApplication.updateMany({
        where: { userId: userId },
        data: applicationUpdateData,
      });
    }

    console.log('✅ Driver profile updated (simplified):', {
      userId,
      updatedFields: Object.keys(body),
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });

  } catch (error) {
    console.error('❌ Error updating driver profile:', error);
    return NextResponse.json(
      {
        error: 'Failed to update profile',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
