import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiHandler, requireRole, httpJson } from '@/lib/api/guard';
import { parseParams } from '@/lib/validation/helpers';
import { bookingIdParam } from '@/lib/validation/schemas';

export const GET = withApiHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  // TODO: Add proper authorization - customer can only access own booking, admin can access all
  const auth = await requireRole(request, "admin");
  if (auth) return auth;

  const paramValidation = parseParams(params, bookingIdParam);
  if (!paramValidation.ok) return paramValidation.error;

  const booking = await prisma.booking.findUnique({
    where: { id: paramValidation.data.id },
    include: {
      pickupAddress: true,
      dropoffAddress: true,
      pickupProperty: true,
      dropoffProperty: true,
      items: true,
    },
  });

  if (!booking) {
    return httpJson(404, { error: 'Booking not found' });
  }

  // Format the response for the frontend
  const formattedBooking = {
    id: booking.id,
    reference: booking.reference,
    status: booking.status,
    scheduledAt: booking.scheduledAt,
    estimatedDurationMinutes: booking.estimatedDurationMinutes,
    crewSize: booking.crewSize,
    
    // Addresses
    pickup: {
      address: booking.pickupAddress.label,
      postcode: booking.pickupAddress.postcode,
      coordinates: {
        lat: booking.pickupAddress.lat,
        lng: booking.pickupAddress.lng,
      },
      property: {
        type: booking.pickupProperty.propertyType,
        access: booking.pickupProperty.accessType,
        floors: booking.pickupProperty.floors,
      },
    },
    
    dropoff: {
      address: booking.dropoffAddress.label,
      postcode: booking.dropoffAddress.postcode,
      coordinates: {
        lat: booking.dropoffAddress.lat,
        lng: booking.dropoffAddress.lng,
      },
      property: {
        type: booking.dropoffProperty.propertyType,
        access: booking.dropoffProperty.accessType,
        floors: booking.dropoffProperty.floors,
      },
    },
    
    // Items
    items: booking.items.map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      volumeM3: item.volumeM3,
    })),
    
    // Customer
    customer: {
      name: booking.customerName,
      phone: booking.customerPhone,
      email: booking.customerEmail,
    },
    
    // Payment
    payment: {
      status: booking.status,
      paidAt: booking.paidAt,
    },
    
    // Metadata
    createdAt: booking.createdAt,
  };

  return httpJson(200, formattedBooking);
});
