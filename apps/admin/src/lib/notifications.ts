import { prisma } from './prisma';
import { getPusherServer } from './pusher';
import { NotificationType } from '@prisma/client';

// Helper function to derive timeSlot from scheduledAt
function getTimeSlotFromDate(scheduledAt: Date): string {
  const hour = scheduledAt.getHours();
  if (hour < 12) return '09:00-12:00'; // AM slot
  if (hour < 17) return '12:00-17:00'; // PM slot
  return '17:00-21:00'; // Evening slot
}

interface CreateNotificationData {
  driverId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
}

interface NotificationPreferences {
  pushJobOffers: boolean;
  pushJobUpdates: boolean;
  pushMessages: boolean;
  pushScheduleChanges: boolean;
  pushPayoutEvents: boolean;
  pushSystemAlerts: boolean;
}

export async function createDriverNotification(data: CreateNotificationData) {
  try {
    // Create the notification in the database
    const notification = await prisma.driverNotification.create({
      data: {
        driverId: data.driverId,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data || null,
      },
    });

    // Get driver's notification preferences
    const preferences = await prisma.driverNotificationPreferences.findUnique({
      where: { driverId: data.driverId },
    });

    // Check if push notification should be sent based on type and preferences
    const shouldSendPush = shouldSendPushNotification(data.type, preferences);

    if (shouldSendPush) {
      // Send realtime notification via Pusher
      await getPusherServer().trigger(
        `driver-${data.driverId}`,
        'notification',
        {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data,
          createdAt: notification.createdAt,
        }
      );
    }

    return notification;
  } catch (error) {
    console.error('Error creating driver notification:', error);
    throw error;
  }
}

function shouldSendPushNotification(
  type: NotificationType,
  preferences?: NotificationPreferences | null
): boolean {
  if (!preferences) return true; // Default to true if no preferences set

  switch (type) {
    case 'job_offer':
      return preferences.pushJobOffers;
    case 'job_update':
    case 'job_cancelled':
    case 'job_completed':
      return preferences.pushJobUpdates;
    case 'message_received':
      return preferences.pushMessages;
    case 'schedule_change':
      return preferences.pushScheduleChanges;
    case 'payout_processed':
    case 'payout_failed':
      return preferences.pushPayoutEvents;
    case 'system_alert':
    case 'document_expiry':
    case 'performance_update':
    case 'incident_reported':
      return preferences.pushSystemAlerts;
    default:
      return true;
  }
}

export async function getUnreadNotificationCount(
  driverId: string
): Promise<number> {
  try {
    return await prisma.driverNotification.count({
      where: {
        driverId,
        read: false,
      },
    });
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
}

export async function markNotificationsAsRead(
  driverId: string,
  notificationIds?: string[]
): Promise<void> {
  try {
    if (notificationIds && notificationIds.length > 0) {
      await prisma.driverNotification.updateMany({
        where: {
          id: { in: notificationIds },
          driverId,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });
    } else {
      await prisma.driverNotification.updateMany({
        where: {
          driverId,
          read: false,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });
    }
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    throw error;
  }
}

// Helper functions for common notification types
export async function notifyJobOffer(driverId: string, jobData: any) {
  return createDriverNotification({
    driverId,
    type: 'job_offer',
    title: 'New Job Available',
    message: `A new job is available near you. Estimated payout: £${(jobData.estimatedPayout / 100).toFixed(2)}`,
    data: { jobId: jobData.id, estimatedPayout: jobData.estimatedPayout },
  });
}

export async function notifyJobUpdate(
  driverId: string,
  jobId: string,
  update: string
) {
  return createDriverNotification({
    driverId,
    type: 'job_update',
    title: 'Job Update',
    message: update,
    data: { jobId },
  });
}

export async function notifyMessageReceived(
  driverId: string,
  messageData: any
) {
  return createDriverNotification({
    driverId,
    type: 'message_received',
    title: 'New Message',
    message: `You have a new message from ${messageData.senderName}`,
    data: { messageId: messageData.id, senderId: messageData.senderId },
  });
}

export async function notifyPayoutProcessed(driverId: string, payoutData: any) {
  return createDriverNotification({
    driverId,
    type: 'payout_processed',
    title: 'Payout Processed',
    message: `Your payout of £${(payoutData.amount / 100).toFixed(2)} has been processed`,
    data: { payoutId: payoutData.id, amount: payoutData.amount },
  });
}

export async function notifyDocumentExpiry(
  driverId: string,
  documentData: any
) {
  return createDriverNotification({
    driverId,
    type: 'document_expiry',
    title: 'Document Expiring Soon',
    message: `Your ${documentData.type} expires on ${documentData.expiryDate}`,
    data: {
      documentId: documentData.id,
      type: documentData.type,
      expiryDate: documentData.expiryDate,
    },
  });
}

export interface AdminNotificationData {
  type:
    | 'new_booking'
    | 'payment_completed'
    | 'booking_cancelled'
    | 'driver_assigned';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  data: any;
  actionUrl?: string;
}

export async function sendAdminNotification(booking: any, session?: any) {
  try {
    console.log(
      '📧 Sending admin notification for booking:',
      booking.reference
    );

    // Create admin notification in database
    const notification = await prisma.adminNotification.create({
      data: {
        type: 'new_booking',
        title: `New Booking Confirmed - ${booking.unifiedBookingId || booking.reference}`,
        message: `Customer ${booking.customerName} has completed a booking for £${booking.totalGBP}`,
        priority: 'high',
        data: {
          bookingId: booking.id,
          reference: booking.reference,
          unifiedBookingId: booking.unifiedBookingId,
          customer: {
            name: booking.customerName,
            email: booking.customerEmail,
            phone: booking.customerPhone,
          },
          addresses: {
            pickup: {
              line1: booking.pickupAddress?.label,
              city: booking.pickupAddress?.city,
              postcode: booking.pickupAddress?.postcode,
            },
            dropoff: {
              line1: booking.dropoffAddress?.label,
              city: booking.dropoffAddress?.city,
              postcode: booking.dropoffAddress?.postcode,
            },
          },
          properties: {
            pickup: {
              type: booking.pickupProperty?.propertyType,
              floor: booking.pickupProperty?.floors,
              access: booking.pickupProperty?.accessType,
            },
            dropoff: {
              type: booking.dropoffProperty?.propertyType,
              floor: booking.dropoffProperty?.floors,
              access: booking.dropoffProperty?.accessType,
            },
          },
          schedule: {
            date: booking.scheduledAt,
            timeSlot: getTimeSlotFromDate(booking.scheduledAt),
          },
          items: booking.items || [],
          pricing: {
            total: booking.totalGBP,
            breakdown: booking.metadata?.pricingBreakdown || {},
          },
          payment: {
            stripeSessionId: session?.id,
            stripePaymentIntentId: session?.payment_intent,
            amount: session?.amount_total,
            currency: session?.currency,
          },
        },
        actionUrl: `/admin/bookings/${booking.id}`,
        isRead: false,
        createdAt: new Date(),
      },
    });

    console.log('✅ Admin notification created:', notification.id);

    // Send email notification to admin (if configured)
    await sendAdminEmailNotification(notification);

    // Send real-time notification via Pusher (if configured)
    await sendRealtimeNotification(notification);

    return notification;
  } catch (error) {
    console.error('❌ Error sending admin notification:', error);
    // Don't throw error - notification failure shouldn't break the booking flow
  }
}

async function sendAdminEmailNotification(notification: any) {
  try {
    // Get admin email addresses
    const adminUsers = await prisma.user.findMany({
      where: {
        role: 'admin',
        isActive: true,
        emailVerified: true,
      },
      select: {
        email: true,
        name: true,
      },
    });

    if (adminUsers.length === 0) {
      console.log('ℹ️ No admin users found for email notification');
      return;
    }

    // TODO: Implement email sending logic
    // This would typically use SendGrid, AWS SES, or similar service
    console.log(
      `📧 Would send email notification to ${adminUsers.length} admin users`
    );

    for (const admin of adminUsers) {
      console.log(`  - ${admin.name} (${admin.email})`);
    }
  } catch (error) {
    console.error('❌ Error sending admin email notification:', error);
  }
}

async function sendRealtimeNotification(notification: any) {
  try {
    // TODO: Implement real-time notification via Pusher
    // This would send a notification to the admin dashboard
    console.log('🔔 Would send real-time notification via Pusher');
  } catch (error) {
    console.error('❌ Error sending real-time notification:', error);
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    await prisma.adminNotification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });

    console.log('✅ Notification marked as read:', notificationId);
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
  }
}

export async function getUnreadNotifications() {
  try {
    const notifications = await prisma.adminNotification.findMany({
      where: { isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return notifications;
  } catch (error) {
    console.error('❌ Error getting unread notifications:', error);
    return [];
  }
}
