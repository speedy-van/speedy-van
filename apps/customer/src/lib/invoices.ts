import { prisma } from '@/lib/prisma';
import { buildInvoicePDF } from './pdf-server';

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupAddress: string;
  dropoffAddress: string;
  scheduledAt: Date;
  crewSize: string;
  baseDistanceMiles: number;
  distanceCostGBP: number;
  accessSurchargeGBP: number;
  weatherSurchargeGBP: number;
  itemsSurchargeGBP: number;
  crewMultiplierPercent: number;
  availabilityMultiplierPercent: number;
  totalGBP: number;
  stripePaymentIntentId?: string;
  paidAt: Date;
  status: string;
  generatedAt: Date;
  updatedAt: Date;
  pdfUrl?: string;
}

export interface CreateInvoiceInput {
  bookingId: string;
  stripePaymentIntentId?: string;
  paidAt: Date;
}

/**
 * Create an invoice for a paid booking
 */
export async function createInvoiceForBooking(
  input: CreateInvoiceInput
): Promise<InvoiceData> {
  try {
    // Get the complete booking data
    const booking = await prisma.booking.findUnique({
      where: { id: input.bookingId },
      include: {
        pickupAddress: true,
        dropoffAddress: true,
        items: true,
      },
    });

    if (!booking) {
      throw new Error(`Booking not found: ${input.bookingId}`);
    }

    if (booking.status !== 'CONFIRMED') {
      throw new Error(`Booking is not confirmed: ${input.bookingId}`);
    }

    // Generate invoice number
    const invoiceNumber = `INV-${booking.reference}`;

    // Format addresses
    const pickupAddress = formatAddress(booking.pickupAddress);
    const dropoffAddress = formatAddress(booking.dropoffAddress);

    // TODO: Implement when Invoice model is added to schema
    console.warn('Invoice creation not yet implemented');

    // Return mock invoice data for now
    const mockInvoice = {
      id: 'mock-invoice-id',
      invoiceNumber,
      bookingId: booking.id,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      pickupAddress,
      dropoffAddress,
      scheduledAt: booking.scheduledAt,
      crewSize: booking.crewSize,
      baseDistanceMiles: booking.baseDistanceMiles,
      distanceCostGBP: booking.distanceCostGBP,
      accessSurchargeGBP: booking.accessSurchargeGBP,
      weatherSurchargeGBP: booking.weatherSurchargeGBP,
      itemsSurchargeGBP: booking.itemsSurchargeGBP,
      crewMultiplierPercent: booking.crewMultiplierPercent,
      availabilityMultiplierPercent: booking.availabilityMultiplierPercent,
      totalGBP: booking.totalGBP,
      stripePaymentIntentId: input.stripePaymentIntentId,
      paidAt: input.paidAt,
      status: 'paid',
      generatedAt: new Date(),
      updatedAt: new Date(),
    };

    console.log(
      `✅ Mock invoice created: ${mockInvoice.invoiceNumber} for booking ${booking.reference}`
    );

    return mockInvoice;
  } catch (error) {
    console.error('❌ Error creating invoice:', error);
    throw error;
  }
}

/**
 * Get all invoices for a customer
 */
export async function getCustomerInvoices(
  customerEmail: string,
  page: number = 1,
  limit: number = 20
) {
  try {
    // TODO: Implement when Invoice model is added to schema
    console.warn('Invoice functionality not yet implemented');

    return {
      invoices: [],
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0,
      },
    };
  } catch (error) {
    console.error('❌ Error fetching customer invoices:', error);
    throw error;
  }
}

/**
 * Get all invoices for admin dashboard
 */
export async function getAdminInvoices(
  page: number = 1,
  limit: number = 20,
  filters: {
    search?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
  } = {}
) {
  try {
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (filters.search) {
      where.OR = [
        { invoiceNumber: { contains: filters.search, mode: 'insensitive' } },
        { customerName: { contains: filters.search, mode: 'insensitive' } },
        { customerEmail: { contains: filters.search, mode: 'insensitive' } },
        {
          booking: {
            reference: { contains: filters.search, mode: 'insensitive' },
          },
        },
      ];
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.fromDate || filters.toDate) {
      where.paidAt = {};
      if (filters.fromDate) where.paidAt.gte = new Date(filters.fromDate);
      if (filters.toDate) where.paidAt.lte = new Date(filters.toDate);
    }

    // TODO: Implement when Invoice model is added to schema
    console.warn('Admin invoice functionality not yet implemented');

    const invoices: any[] = [];
    const total = 0;
    const summary = { _sum: { totalGBP: 0 }, _count: { id: 0 } };

    return {
      invoices: invoices.map(invoice => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        reference: invoice.booking?.reference || 'N/A',
        customer: {
          id: invoice.booking?.customerId,
          name: invoice.customerName,
          email: invoice.customerEmail,
          phone: invoice.customerPhone,
        },
        totalGBP: invoice.totalGBP,
        status: invoice.status,
        paidAt: invoice.paidAt,
        createdAt: invoice.generatedAt,
        pickupAddress: invoice.pickupAddress,
        dropoffAddress: invoice.dropoffAddress,
        driver: invoice.booking?.driver
          ? {
              id: invoice.booking.driver.id,
              name: invoice.booking.driver.user.name,
              email: invoice.booking.driver.user.email,
            }
          : null,
        paymentIntentId: invoice.stripePaymentIntentId,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      summary: {
        totalRevenue: summary._sum.totalGBP || 0,
        totalInvoices: summary._count.id || 0,
      },
    };
  } catch (error) {
    console.error('❌ Error fetching admin invoices:', error);
    throw error;
  }
}

/**
 * Get a specific invoice by ID
 */
export async function getInvoiceById(invoiceId: string) {
  try {
    // TODO: Implement when Invoice model is added to schema
    console.warn('Invoice functionality not yet implemented');
    throw new Error(`Invoice not found: ${invoiceId}`);
  } catch (error) {
    console.error('❌ Error fetching invoice:', error);
    throw error;
  }
}

/**
 * Generate PDF for an invoice
 */
export async function generateInvoicePDF(invoiceId: string): Promise<Buffer> {
  try {
    // TODO: Implement when Invoice model is added to schema
    console.warn('Invoice PDF generation not yet implemented');
    throw new Error(`Invoice PDF generation not yet implemented: ${invoiceId}`);
  } catch (error) {
    console.error('❌ Error generating invoice PDF:', error);
    throw error;
  }
}

/**
 * Format address for display
 */
function formatAddress(address: any): string {
  if (!address) return 'Address not specified';

  const parts = [
    address.street,
    address.city,
    address.county,
    address.postcode,
  ].filter(Boolean);

  return parts.join(', ');
}
