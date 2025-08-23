import { NextResponse } from "next/server";
import { requireDriver } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireDriver();
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = (session.user as any).id;
    
    // Get the driver record
    const driver = await prisma.driver.findUnique({
      where: { userId }
    });

    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    // Get the job details
    const job = await prisma.booking.findUnique({
      where: {
        id: params.id
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true
          }
        },
        items: true,
        pickupAddress: true,
        dropoffAddress: true,
        Assignment: {
          where: {
            driverId: driver.id
          },
          include: {
            Driver: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check if job is available or claimed by this driver
    const isAvailable = !job.Assignment;
    const isClaimedByMe = job.Assignment && job.Assignment.driverId === driver.id;

    // Get items from the BookingItem relation
    const items = job.items || [];

    // Format the response
    const jobDetails = {
      id: job.id,
      reference: job.reference,
      status: isAvailable ? 'available' : (isClaimedByMe ? 'claimed' : 'claimed_by_other'),
      pickupAddress: job.pickupAddress?.label || '',
      dropoffAddress: job.dropoffAddress?.label || '',
      scheduledAt: job.scheduledAt?.toISOString().split('T')[0] || '',
      totalGBP: job.totalGBP || 0,
      distance: job.baseDistanceMiles || 0,
      estimatedDuration: job.estimatedDurationMinutes || 0,
      items: items.map((item: any) => ({
        name: item.name || 'Unknown Item',
        quantity: item.quantity || 1,
        volumeM3: item.volumeM3 || 0
      })),
      customer: job.customer,
      createdAt: job.createdAt.toISOString(),
      claimedAt: job.Assignment?.claimedAt?.toISOString(),
      driverId: job.Assignment?.driverId
    };

    return NextResponse.json({ job: jobDetails });
  } catch (error) {
    console.error('Error fetching job details:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
