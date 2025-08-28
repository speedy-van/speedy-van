import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { buildInvoicePDF } from '@/lib/pdf';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireRole('customer');
    const customerId = (session!.user as any).id as string;

    // Get the booking/invoice
    const booking = await prisma.booking.findFirst({
      where: {
        id: params.id,
        customerId
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
        customer: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Generate PDF using the new function
    const pdfBuffer = await buildInvoicePDF({
      company: {
        name: 'Speedy Van',
        address: '123 Moving Street, London, UK',
        email: 'hello@speedy-van.co.uk',
        phone: '07901846297',
        vatNumber: 'GB123456789'
      },
      invoice: {
        invoiceNumber: `INV-${booking.reference}`,
        orderRef: booking.reference,
        date: booking.createdAt,
        dueDate: booking.createdAt, // Same as invoice date for simplicity
        totalGBP: booking.totalGBP,
        currency: 'GBP',
        status: booking.paidAt ? 'paid' : 'unpaid',
        paidAt: booking.paidAt,
        customer: {
          name: booking.customer?.name || booking.customerName || 'Customer',
          email: booking.customer?.email || booking.customerEmail || '',
          phone: booking.customerPhone
        },
        crewSize: booking.crewSize ? (booking.crewSize === 'ONE' ? 1 : booking.crewSize === 'TWO' ? 2 : booking.crewSize === 'THREE' ? 3 : booking.crewSize === 'FOUR' ? 4 : 2) : undefined
      }
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
