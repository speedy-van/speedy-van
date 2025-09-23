import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location'); // Optional: filter by location
    const limit = parseInt(searchParams.get('limit') || '50');

    console.log('🚗 Admin fetching available drivers:', { location, limit });

    // Get online drivers who are available for new assignments
    const availableDrivers = await prisma.driver.findMany({
      where: {
        status: 'active',
        onboardingStatus: 'approved',
        availability: {
          status: 'online',
          locationConsent: true,
        },
        // Don't include drivers who are already assigned to this specific booking
        // This will be handled in the frontend
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            // phone removed - not in schema
          }
        },
        availability: {
          select: {
            lastLat: true,
            lastLng: true,
            lastSeenAt: true,
            status: true,
          }
        },
        Assignment: {
          where: {
            status: {
              in: ['accepted', 'claimed']
            }
          },
          select: {
            id: true,
            status: true,
            claimedAt: true,
            Booking: {
              select: {
                reference: true,
                customerName: true,
                pickupAddress: {
                  select: {
                    label: true,
                    postcode: true,
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        availability: {
          lastSeenAt: 'desc'
        }
      },
      take: limit,
    });

    // Transform the data for frontend
    const transformedDrivers = availableDrivers.map(driver => {
      const activeJobs = driver.Assignment.filter(assignment => 
        assignment.status === 'accepted' || assignment.status === 'claimed'
      );

      return {
        id: driver.id,
        name: driver.user.name,
        email: driver.user.email,
        // phone removed - not in schema
        status: driver.status,
        onboardingStatus: driver.onboardingStatus,
        availability: {
          status: driver.availability?.status || 'offline',
          lastSeenAt: driver.availability?.lastSeenAt,
          location: driver.availability?.lastLat && driver.availability?.lastLng ? {
            lat: driver.availability.lastLat,
            lng: driver.availability.lastLng,
          } : null,
        },
        activeJobs: activeJobs.map(assignment => ({
          id: assignment.id,
          status: assignment.status,
          claimedAt: assignment.claimedAt,
          booking: {
            reference: assignment.Booking.reference,
            customerName: assignment.Booking.customerName,
            pickupAddress: assignment.Booking.pickupAddress?.label,
            postcode: assignment.Booking.pickupAddress?.postcode,
          }
        })),
        isAvailable: activeJobs.length === 0, // Available if no active jobs
        totalActiveJobs: activeJobs.length,
      };
    });

    // Sort by availability (available drivers first, then by last seen)
    const sortedDrivers = transformedDrivers.sort((a, b) => {
      if (a.isAvailable && !b.isAvailable) return -1;
      if (!a.isAvailable && b.isAvailable) return 1;
      return new Date(b.availability.lastSeenAt || 0).getTime() - new Date(a.availability.lastSeenAt || 0).getTime();
    });

    return NextResponse.json({
      success: true,
      data: {
        drivers: sortedDrivers,
        total: sortedDrivers.length,
        available: sortedDrivers.filter(d => d.isAvailable).length,
        busy: sortedDrivers.filter(d => !d.isAvailable).length,
      }
    });

  } catch (error) {
    console.error('❌ Error fetching available drivers:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch available drivers',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
