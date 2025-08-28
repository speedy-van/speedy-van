import { prisma } from '@/lib/prisma';

export interface CustomerBooking {
  id: string;
  reference: string;
  unifiedBookingId?: string;
  status: string;
  scheduledAt: Date;
  totalGBP: number;
  pickupAddress: {
    line1: string;
    city: string;
    postcode: string;
  };
  dropoffAddress: {
    line1: string;
    city: string;
    postcode: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    volumeM3: number;
  }>;
  createdAt: Date;
  paidAt?: Date;
}

export interface BookingLinkingResult {
  linkedBookings: number;
  totalBookings: number;
  message: string;
}

/**
 * Links existing bookings to a newly created customer account
 * based on matching email or phone number
 */
export async function linkExistingBookingsToCustomer(
  userId: string,
  email: string,
  phone: string
): Promise<BookingLinkingResult> {
  try {
    console.log('🔗 Linking existing bookings for customer:', { userId, email, phone });

    // Find all bookings that match the customer's email or phone
    const existingBookings = await prisma.booking.findMany({
      where: {
        OR: [
          { customerEmail: email },
          { customerPhone: phone }
        ],
        customerId: null // Only unlinked bookings
      },
      select: {
        id: true,
        reference: true,
        status: true,
        customerEmail: true,
        customerPhone: true
      }
    });

    if (existingBookings.length === 0) {
      return {
        linkedBookings: 0,
        totalBookings: 0,
        message: 'No existing bookings found to link'
      };
    }

    // Update all matching bookings to link them to the customer
    const updateResult = await prisma.booking.updateMany({
      where: {
        OR: [
          { customerEmail: email },
          { customerPhone: phone }
        ],
        customerId: null
      },
      data: {
        customerId: userId,
        updatedAt: new Date()
      }
    });

    // Create audit log entries for the linking
    for (const booking of existingBookings) {
      await prisma.auditLog.create({
        data: {
          actorId: userId,
          actorRole: 'customer',
          action: 'booking_linked_to_account',
          targetType: 'booking',
          targetId: booking.id,
          userId: userId,
          details: {
            reference: booking.reference,
            linkedAt: new Date().toISOString(),
            reason: 'Account creation - email/phone match',
            previousStatus: 'unlinked'
          }
        }
      });
    }

    console.log('✅ Successfully linked', updateResult.count, 'bookings to customer:', userId);

    return {
      linkedBookings: updateResult.count,
      totalBookings: existingBookings.length,
      message: `Successfully linked ${updateResult.count} existing booking${updateResult.count !== 1 ? 's' : ''} to your account`
    };

  } catch (error) {
    console.error('❌ Error linking existing bookings to customer:', error);
    throw new Error('Failed to link existing bookings to your account');
  }
}

/**
 * Fetches all bookings for a customer (both linked and unlinked)
 */
export async function getCustomerBookings(userId: string): Promise<{
  linkedBookings: CustomerBooking[];
  unlinkedBookings: CustomerBooking[];
  totalCount: number;
}> {
  try {
    // Get linked bookings (those with customerId)
    const linkedBookings = await prisma.booking.findMany({
      where: { customerId: userId },
      include: {
        pickupAddress: true,
        dropoffAddress: true,
        items: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get unlinked bookings (those without customerId but matching email/phone)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const unlinkedBookings = await prisma.booking.findMany({
      where: {
        OR: [
          { customerEmail: user.email }
        ],
        customerId: null
      },
      include: {
        pickupAddress: true,
        dropoffAddress: true,
        items: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format the bookings
    const formatBooking = (booking: any): CustomerBooking => ({
      id: booking.id,
      reference: booking.reference,
      unifiedBookingId: booking.reference,
      status: booking.status,
      scheduledAt: booking.scheduledAt,
      totalGBP: booking.totalGBP,
      pickupAddress: {
        line1: booking.pickupAddress.label,
        city: booking.pickupAddress.city,
        postcode: booking.pickupAddress.postcode
      },
      dropoffAddress: {
        line1: booking.dropoffAddress.label,
        city: booking.dropoffAddress.city,
        postcode: booking.dropoffAddress.postcode
      },
      items: booking.items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        volumeM3: item.volumeM3
      })),
      createdAt: booking.createdAt,
      paidAt: booking.paidAt
    });

    const formattedLinkedBookings = linkedBookings.map(formatBooking);
    const formattedUnlinkedBookings = unlinkedBookings.map(formatBooking);

    return {
      linkedBookings: formattedLinkedBookings,
      unlinkedBookings: formattedUnlinkedBookings,
      totalCount: formattedLinkedBookings.length + formattedUnlinkedBookings.length
    };

  } catch (error) {
    console.error('❌ Error fetching customer bookings:', error);
    throw new Error('Failed to fetch your bookings');
  }
}

/**
 * Links a specific unlinked booking to the customer account
 */
export async function linkSpecificBooking(
  userId: string,
  bookingId: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Verify the booking exists and can be linked
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        customerId: null,
        OR: [
          { customerEmail: { equals: (await prisma.user.findUnique({ where: { id: userId } }))?.email } }
        ]
      }
    });

    if (!booking) {
      return {
        success: false,
        message: 'Booking not found or cannot be linked to your account'
      };
    }

    // Link the booking
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        customerId: userId,
        updatedAt: new Date()
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorId: userId,
        actorRole: 'customer',
        action: 'booking_manually_linked',
        targetType: 'booking',
        targetId: bookingId,
        userId: userId,
        details: {
          reference: booking.reference,
          linkedAt: new Date().toISOString(),
          reason: 'Manual linking by customer'
        }
      }
    });

    return {
      success: true,
      message: `Successfully linked booking ${booking.reference} to your account`
    };

  } catch (error) {
    console.error('❌ Error linking specific booking:', error);
    return {
      success: false,
      message: 'Failed to link booking to your account'
    };
  }
}

/**
 * Gets booking statistics for a customer
 */
export async function getCustomerBookingStats(userId: string): Promise<{
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  totalSpent: number;
  averageBookingValue: number;
}> {
  try {
    const linkedBookings = await prisma.booking.findMany({
      where: { customerId: userId },
      select: {
        status: true,
        totalGBP: true
      }
    });

    const totalBookings = linkedBookings.length;
    const completedBookings = linkedBookings.filter(b => b.status === 'COMPLETED').length;
    const pendingBookings = linkedBookings.filter(b => ['PENDING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS'].includes(b.status)).length;
    const totalSpent = linkedBookings
      .filter(b => b.status === 'COMPLETED')
      .reduce((sum, b) => sum + b.totalGBP, 0);
    const averageBookingValue = totalBookings > 0 ? totalSpent / totalBookings : 0;

    return {
      totalBookings,
      completedBookings,
      pendingBookings,
      totalSpent,
      averageBookingValue
    };

  } catch (error) {
    console.error('❌ Error fetching customer booking stats:', error);
    throw new Error('Failed to fetch booking statistics');
  }
}
