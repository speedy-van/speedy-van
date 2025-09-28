import { useEffect, useRef } from 'react';
import { useAudioNotification, showJobNotificationWithSound } from '../components/driver/AudioNotification';

// Pusher notification types
interface JobNotificationData {
  bookingId: string;
  jobType: string;
  pickup: {
    address: string;
    postcode: string;
  };
  delivery: {
    address: string;
    postcode: string;
  };
  distance: number;
  estimatedDuration: number;
  price: number;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  customerName?: string;
}

interface NotificationPayload {
  type: 'new-job' | 'job-cancelled' | 'job-updated' | 'urgent-job';
  data: JobNotificationData;
  timestamp: string;
  urgent?: boolean;
}

// Driver notification service with audio
export class DriverNotificationService {
  private pusher: any = null;
  private channel: any = null;
  private driverId: string | null = null;
  private audioEnabled = true;
  private notificationPermission = false;

  constructor() {
    this.initializeNotificationPermission();
  }

  private async initializeNotificationPermission() {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        this.notificationPermission = permission === 'granted';
      } else {
        this.notificationPermission = Notification.permission === 'granted';
      }
    }
  }

  async initialize(driverId: string) {
    try {
      this.driverId = driverId;

      // Initialize Pusher (dynamically import to avoid SSR issues)
      if (typeof window !== 'undefined') {
        const Pusher = (await import('pusher-js')).default;
        
        this.pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
          cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
          forceTLS: true,
        });

        // Subscribe to driver-specific channel
        const channelName = `driver-${driverId}`;
        this.channel = this.pusher.subscribe(channelName);

        // Listen for new job notifications
        this.channel.bind('new-job', this.handleNewJobNotification.bind(this));
        this.channel.bind('urgent-job', this.handleUrgentJobNotification.bind(this));
        this.channel.bind('job-cancelled', this.handleJobCancelledNotification.bind(this));
        
        console.log(`🔔 Driver notifications initialized for channel: ${channelName}`);
      }
    } catch (error) {
      console.error('❌ Failed to initialize driver notifications:', error);
    }
  }

  private async handleNewJobNotification(payload: NotificationPayload) {
    console.log('🚀 New job notification received:', payload);

    const { data } = payload;
    const isUrgent = payload.urgent || data.priority === 'urgent';

    try {
      console.log('🔊 Attempting to play job notification sound...');
      
      // Play notification sound with browser notification
      await showJobNotificationWithSound(
        `🚚 وظيفة جديدة متاحة`,
        `${data.pickup?.address || 'موقع الاستلام'} → ${data.delivery?.address || 'موقع التسليم'}\n💰 £${data.price || '0'} | 📍 ${data.distance || '0'}km`,
        {
          urgent: isUrgent,
          requireInteraction: isUrgent,
        }
      );

      console.log(`✅ Audio notification played successfully for job ${data.bookingId || 'unknown'}`);

      // Optionally vibrate on mobile
      if ('vibrate' in navigator) {
        navigator.vibrate(isUrgent ? [200, 100, 200, 100, 200] : [200, 100, 200]);
      }

    } catch (error) {
      console.error('❌ Failed to play job notification:', error);
      
      // Fallback: Show browser notification without sound
      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🚚 وظيفة جديدة متاحة (بدون صوت)', {
            body: `${data.pickup?.address || 'موقع الاستلام'} → ${data.delivery?.address || 'موقع التسليم'}`,
            icon: '/favicon.ico',
            tag: 'job-notification-fallback',
            requireInteraction: isUrgent,
          });
          console.log('📢 Fallback browser notification shown (audio failed)');
        } else {
          console.log('⚠️ Browser notifications not available or not permitted');
        }
      } catch (fallbackError) {
        console.error('❌ Fallback notification also failed:', fallbackError);
      }
    }
  }

  private async handleUrgentJobNotification(payload: NotificationPayload) {
    console.log('🚨 Urgent job notification received:', payload);

    const { data } = payload;

    try {
      // Play urgent notification sound
      await showJobNotificationWithSound(
        `🚨 وظيفة عاجلة - ${data.jobType}`,
        `من ${data.pickup.address} إلى ${data.delivery.address}\nالسعر: £${data.price} | العميل: ${data.customerName}`,
        {
          urgent: true,
          requireInteraction: true,
        }
      );

      // Continuous vibration for urgent jobs
      if ('vibrate' in navigator) {
        navigator.vibrate([300, 100, 300, 100, 300, 100, 300]);
      }

      console.log(`🚨 Urgent audio notification played for job ${data.bookingId}`);

    } catch (error) {
      console.error('❌ Failed to handle urgent job notification:', error);
    }
  }

  private async handleJobCancelledNotification(payload: NotificationPayload) {
    console.log('❌ Job cancelled notification received:', payload);

    try {
      // Play a softer notification for cancellation
      const audio = new Audio('/audio/job-notification.m4a');
      audio.volume = 0.5; // Softer for cancellation
      await audio.play();

      if (this.notificationPermission) {
        new Notification('تم إلغاء الوظيفة', {
          body: `تم إلغاء الوظيفة رقم ${payload.data.bookingId}`,
          icon: '/favicon.ico',
          tag: 'job-cancelled',
        });
      }

    } catch (error) {
      console.error('❌ Failed to handle job cancelled notification:', error);
    }
  }

  setAudioEnabled(enabled: boolean) {
    this.audioEnabled = enabled;
    console.log(`🔊 Audio notifications ${enabled ? 'enabled' : 'disabled'}`);
  }

  disconnect() {
    if (this.channel) {
      this.channel.unbind_all();
      this.pusher?.unsubscribe(this.channel.name);
    }
    if (this.pusher) {
      this.pusher.disconnect();
    }
    console.log('🔔 Driver notifications disconnected');
  }
}

// React hook for driver notifications
export function useDriverNotifications(driverId?: string) {
  const serviceRef = useRef<DriverNotificationService | null>(null);
  const audioNotification = useAudioNotification();

  useEffect(() => {
    if (!driverId) return;

    // Initialize service
    if (!serviceRef.current) {
      serviceRef.current = new DriverNotificationService();
    }

    serviceRef.current.initialize(driverId);

    // Cleanup on unmount
    return () => {
      if (serviceRef.current) {
        serviceRef.current.disconnect();
        serviceRef.current = null;
      }
    };
  }, [driverId]);

  const setAudioEnabled = (enabled: boolean) => {
    serviceRef.current?.setAudioEnabled(enabled);
  };

  const testNotification = async () => {
    try {
      await audioNotification.play('job-notification');
      await showJobNotificationWithSound(
        'اختبار الإشعارات',
        'هذا اختبار للتأكد من عمل الإشعارات الصوتية',
        { urgent: false }
      );
      console.log('✅ Test notification played successfully');
    } catch (error) {
      console.error('❌ Test notification failed:', error);
    }
  };

  return {
    setAudioEnabled,
    testNotification,
    isSupported: audioNotification.isSupported,
    isPlaying: audioNotification.isPlaying,
  };
}

// Utility to send push notifications to drivers (for admin use)
export async function sendDriverNotification(
  driverId: string,
  notification: NotificationPayload
) {
  try {
    const response = await fetch('/api/admin/notifications/send-to-driver', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        driverId,
        notification,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send notification');
    }

    const result = await response.json();
    console.log('✅ Notification sent to driver:', result);
    return result;

  } catch (error) {
    console.error('❌ Failed to send driver notification:', error);
    throw error;
  }
}