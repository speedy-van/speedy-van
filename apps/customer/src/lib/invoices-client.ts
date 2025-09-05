import { prisma } from '@/lib/prisma';

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
 * Get customer invoices (client-safe version)
 * TODO: Implement when Invoice model is added to schema
 */
export async function getCustomerInvoices(
  userId: string
): Promise<InvoiceData[]> {
  try {
    // TODO: Implement when Invoice model is added to schema
    console.warn('Invoice functionality not yet implemented');
    return [];
  } catch (error) {
    console.error('Error fetching customer invoices:', error);
    throw error;
  }
}

/**
 * Format address for display
 */
function formatAddress(address: any): string {
  if (!address) return '';

  const parts = [
    address.street,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ].filter(Boolean);

  return parts.join(', ');
}
