import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/portal/bookings/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireRole('customer');
    const customerId = (session!.user as any).id as string;
    const bookingId = params.id;

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        customerId
      },
      select: {
        id: true,
        reference: true,
        status: true,
        scheduledAt: true,
        totalGBP: true,
        crewSize: true,
        customerName: true,
        customerPhone: true,
        customerEmail: true,
        createdAt: true,
        updatedAt: true,
        driver: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true
              }
            },
            rating: true
          }
        },
        Assignment: {
          select: {
            id: true,
            status: true,
            JobEvent: {
              orderBy: { createdAt: 'asc' },
              select: {
                id: true,
                step: true,
                notes: true,
                createdAt: true
              }
            }
          }
        },
        chatSessions: {
          select: {
            id: true,
            messages: {
              orderBy: { createdAt: 'asc' },
              select: {
                id: true,
                content: true,
                senderId: true,
                createdAt: true
              }
            }
          }
        }
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}
