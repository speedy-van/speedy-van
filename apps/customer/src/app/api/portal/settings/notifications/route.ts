import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for notification preferences
const notificationPreferencesSchema = z.object({
  emailBookingConfirmation: z.boolean().optional(),
  emailBookingUpdates: z.boolean().optional(),
  emailPaymentReceipts: z.boolean().optional(),
  emailServiceAlerts: z.boolean().optional(),
  emailMarketing: z.boolean().optional(),
  smsBookingConfirmation: z.boolean().optional(),
  smsBookingUpdates: z.boolean().optional(),
  smsDriverUpdates: z.boolean().optional(),
  smsServiceAlerts: z.boolean().optional(),
  pushBookingUpdates: z.boolean().optional(),
  pushDriverUpdates: z.boolean().optional(),
  pushServiceAlerts: z.boolean().optional(),
});

// GET /api/portal/settings/notifications - Get notification preferences
export async function GET() {
  try {
    const session = await requireRole('customer');
    const customerId = (session!.user as any).id as string;

    // Get or create notification preferences
    let preferences = await prisma.customerNotificationPreferences.findUnique({
      where: { userId: customerId },
    });

    if (!preferences) {
      // Create default preferences
      preferences = await prisma.customerNotificationPreferences.create({
        data: {
          userId: customerId,
          emailBookingConfirmation: true,
          emailBookingUpdates: true,
          emailPaymentReceipts: true,
          emailServiceAlerts: true,
          emailMarketing: false,
          smsBookingConfirmation: false,
          smsBookingUpdates: false,
          smsDriverUpdates: false,
          smsServiceAlerts: false,
          pushBookingUpdates: true,
          pushDriverUpdates: true,
          pushServiceAlerts: true,
        },
      });
    }

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification preferences' },
      { status: 500 }
    );
  }
}

// POST /api/portal/settings/notifications - Update notification preferences
export async function POST(request: NextRequest) {
  try {
    const session = await requireRole('customer');
    const customerId = (session!.user as any).id as string;

    const body = await request.json();
    const validationResult = notificationPreferencesSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    // Update or create notification preferences
    const preferences = await prisma.customerNotificationPreferences.upsert({
      where: { userId: customerId },
      update: validationResult.data,
      create: {
        userId: customerId,
        ...validationResult.data,
      },
    });

    return NextResponse.json({
      message: 'Notification preferences updated successfully',
      preferences,
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update notification preferences' },
      { status: 500 }
    );
  }
}
