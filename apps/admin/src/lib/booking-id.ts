import { prisma } from '@/lib/prisma';

/**
 * Generates a unique unified booking ID with the "SV" prefix
 * Format: SV + YYYYMMDD + 6-digit sequential number
 * Example: SV2025011500001
 *
 * This function ensures uniqueness by checking the database
 */
export async function generateUniqueUnifiedBookingId(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;

  // Find the highest sequence number for today
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );

  const todayBookings = await prisma.booking.findMany({
    where: {
      createdAt: {
        gte: todayStart,
        lt: todayEnd,
      },
      reference: {
        startsWith: `SV${datePrefix}`,
      },
    },
    select: {
      reference: true,
    },
    orderBy: {
      reference: 'desc',
    },
    take: 1,
  });

  let nextSequence = 1;
  if (todayBookings.length > 0) {
    const lastBookingId = todayBookings[0].reference;
    if (lastBookingId && lastBookingId.length >= 16) {
      const lastSequence = parseInt(lastBookingId.substring(10, 16));
      nextSequence = lastSequence + 1;
    }
  }

  // Ensure the sequence number is 6 digits
  const sequenceString = String(nextSequence).padStart(6, '0');

  // Validate that we haven't exceeded 999999 bookings per day
  if (nextSequence > 999999) {
    throw new Error('Maximum daily booking limit exceeded');
  }

  return `SV${datePrefix}${sequenceString}`;
}

/**
 * Generates a unified booking ID without database check (for testing/offline use)
 * Format: SV + YYYYMMDD + 6-digit sequential number
 * Example: SV2025011500001
 */
export function generateUnifiedBookingId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;

  // Generate a 6-digit sequential number (000001 to 999999)
  // In production, this should be fetched from database to ensure uniqueness
  const sequentialNumber = Math.floor(Math.random() * 900000) + 100000;

  return `SV${datePrefix}${sequentialNumber}`;
}

/**
 * Validates if a booking ID follows the correct format
 * @param bookingId - The booking ID to validate
 * @returns boolean indicating if the format is valid
 */
export function isValidBookingId(bookingId: string): boolean {
  const bookingIdRegex = /^SV\d{14}$/;
  return bookingIdRegex.test(bookingId);
}

/**
 * Extracts the date from a booking ID
 * @param bookingId - The booking ID to extract date from
 * @returns Date object or null if invalid
 */
export function extractDateFromBookingId(bookingId: string): Date | null {
  if (!isValidBookingId(bookingId)) {
    return null;
  }

  try {
    const dateString = bookingId.substring(2, 10); // Extract YYYYMMDD
    const year = parseInt(dateString.substring(0, 4));
    const month = parseInt(dateString.substring(4, 6)) - 1; // Month is 0-indexed
    const day = parseInt(dateString.substring(6, 8));

    return new Date(year, month, day);
  } catch (error) {
    return null;
  }
}

/**
 * Formats a booking ID for display with proper spacing
 * @param bookingId - The raw booking ID
 * @returns Formatted booking ID (e.g., "SV 2025 01 15 000001")
 */
export function formatBookingIdForDisplay(bookingId: string): string {
  if (!isValidBookingId(bookingId)) {
    return bookingId;
  }

  const prefix = bookingId.substring(0, 2);
  const year = bookingId.substring(2, 6);
  const month = bookingId.substring(6, 8);
  const day = bookingId.substring(8, 10);
  const sequence = bookingId.substring(10, 16);

  return `${prefix} ${year} ${month} ${day} ${sequence}`;
}

/**
 * Extracts the sequence number from a booking ID
 * @param bookingId - The booking ID to extract sequence from
 * @returns The sequence number or null if invalid
 */
export function extractSequenceFromBookingId(bookingId: string): number | null {
  if (!isValidBookingId(bookingId)) {
    return null;
  }

  try {
    const sequenceString = bookingId.substring(10, 16);
    return parseInt(sequenceString);
  } catch (error) {
    return null;
  }
}
