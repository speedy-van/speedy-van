import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole('customer');
    const customerId = (session!.user as any).id as string;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { customerId };
    if (status && status !== 'all') {
      where.status = status;
    }

    // Get bookings with payment information
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          reference: true,
          createdAt: true,
          totalGBP: true,
          status: true,
          stripePaymentIntentId: true,
          paidAt: true,
          pickupAddress: true,
          dropoffAddress: true,
          customerName: true,
          customerEmail: true,
        },
      }),
      prisma.booking.count({ where }),
    ]);

    const invoices = bookings.map(booking => ({
      id: booking.id,
      orderRef: booking.reference,
      invoiceNumber: `INV-${booking.reference}`,
      date: booking.createdAt,
      amount: booking.totalGBP,
      currency: 'GBP',
      status: booking.status,
      paidAt: booking.paidAt,
      stripePaymentIntentId: booking.stripePaymentIntentId,
      pickupAddress: booking.pickupAddress,
      dropoffAddress: booking.dropoffAddress,
      contactName: booking.customerName,
      contactEmail: booking.customerEmail,
    }));

    return NextResponse.json({
      invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
