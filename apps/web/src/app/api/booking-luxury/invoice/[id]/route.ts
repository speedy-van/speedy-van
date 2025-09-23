import { NextRequest, NextResponse } from 'next/server';
import { buildInvoicePDF } from '@/lib/pdf';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the booking by ID (no authentication required for success page)
    const booking = await prisma.booking.findUnique({
      where: {
        id: params.id,
      },
      select: {
        id: true,
        reference: true,
        createdAt: true,
        totalGBP: true,
        paidAt: true,
        crewSize: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        pickupAddress: {
          select: {
            label: true,
          },
        },
        dropoffAddress: {
          select: {
            label: true,
          },
        },
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Generate PDF using the invoice function
    const pdfBuffer = await buildInvoicePDF({
      invoiceNumber: `INV-${booking.reference}`,
      date: booking.createdAt.toISOString().split('T')[0],
      dueDate: booking.createdAt.toISOString().split('T')[0],
      company: {
        name: 'Speedy Van',
        address: '140 Charles Street, Glasgow City, G21 2QB',
        email: 'support@speedy-van.co.uk',
        phone: '07901846297',
        vatNumber: 'GB123456789',
      },
      customer: {
        name: booking.customerName || booking.customer?.name || 'Customer',
        email: booking.customerEmail || booking.customer?.email || '',
        address: booking.pickupAddress?.label || 'Pickup address not available',
      },
      items: [{
        description: 'Moving Service',
        quantity: 1,
        unitPrice: booking.totalGBP,
        total: booking.totalGBP,
      }],
      subtotal: booking.totalGBP,
      tax: booking.totalGBP * 0.2, // 20% VAT
      total: booking.totalGBP,
      currency: 'GBP',
    });

    // Return PDF response
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${booking.reference}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice PDF' },
      { status: 500 }
    );
  }
}
