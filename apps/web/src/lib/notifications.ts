import { prisma } from './prisma';
import { getPusherServer } from './pusher';
import { NotificationType } from '@prisma/client';

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
      await getPusherServer().trigger(`driver-${data.driverId}`, 'notification', {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        createdAt: notification.createdAt,
      });
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

export async function getUnreadNotificationCount(driverId: string): Promise<number> {
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

export async function notifyJobUpdate(driverId: string, jobId: string, update: string) {
  return createDriverNotification({
    driverId,
    type: 'job_update',
    title: 'Job Update',
    message: update,
    data: { jobId },
  });
}

export async function notifyMessageReceived(driverId: string, messageData: any) {
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

export async function notifyDocumentExpiry(driverId: string, documentData: any) {
  return createDriverNotification({
    driverId,
    type: 'document_expiry',
    title: 'Document Expiring Soon',
    message: `Your ${documentData.type} expires on ${documentData.expiryDate}`,
    data: { documentId: documentData.id, type: documentData.type, expiryDate: documentData.expiryDate },
  });
}
