import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAdminInvoices } from '@/lib/invoices';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const fromDate = searchParams.get('fromDate') || '';
    const toDate = searchParams.get('toDate') || '';

    const result = await getAdminInvoices(page, limit, {
      search,
      status,
      fromDate,
      toDate,
    });

    return NextResponse.json({
      invoices: result.invoices,
      pagination: result.pagination,
      summary: result.summary,
    });
  } catch (error) {
    console.error('Invoices API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Generate invoice number if not exists
    if (!booking.reference) {
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await prisma.booking.update({
        where: { id: bookingId },
        data: { reference: invoiceNumber },
      });
      booking.reference = invoiceNumber;
    }

    // Generate PDF invoice
    const { buildInvoicePDF } = await import('@/lib/pdf');

    const pdfBuffer = await buildInvoicePDF({
      company: {
        name: 'Speedy Van',
        address: '123 Logistics Park, London',
        email: 'billing@speedyvan.example',
        phone: '+44 20 1234 5678',
        vatNumber: 'GB123456789',
      },
      invoice: {
        invoiceNumber: booking.reference!,
        orderRef: booking.reference,
        totalGBP: booking.totalGBP || 0,
        currency: 'GBP',
        date: booking.createdAt,
        dueDate: booking.createdAt,
        status: String(booking.status),
        customer: {
          name: 'Unknown',
          email: 'Unknown',
          phone: 'Unknown',
        },
        pickupAddress: '',
        dropoffAddress: '',
        vanSize: '',
        crewSize: 0,
        extras: {},
        paidAt: booking.paidAt,
      },
    });

    // Return PDF as response
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${booking.reference}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Invoice generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
