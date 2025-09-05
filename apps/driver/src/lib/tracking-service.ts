import Pusher from 'pusher-js';

export interface TrackingData {
  id: string;
  reference: string;
  unifiedBookingId?: string;
  status: string;
  pickupAddress: {
    label: string;
    postcode: string;
    coordinates: { lat: number; lng: number };
  };
  dropoffAddress: {
    label: string;
    postcode: string;
    coordinates: { lat: number; lng: number };
  };
  scheduledAt: string;
  driver?: {
    name: string;
    email: string;
  };
  routeProgress: number;
  currentLocation?: {
    lat: number;
    lng: number;
    timestamp: string;
  };
  eta?: {
    estimatedArrival: string;
    minutesRemaining: number;
    isOnTime: boolean;
  };
  estimatedDuration?: number;
  lastEvent?: {
    step: string;
    createdAt: string;
    notes?: string;
  };
  jobTimeline: Array<{
    step: string;
    label: string;
    timestamp: string;
    notes?: string;
    payload?: any;
  }>;
  trackingChannel: string;
  lastUpdated: string;
}

export interface TrackingUpdate {
  type: 'location' | 'status' | 'progress' | 'eta';
  bookingId: string;
  data: any;
  timestamp: string;
}

export interface RealTimeTrackingOptions {
  bookingId?: string;
  enabled?: boolean;
  onUpdate?: (update: TrackingUpdate) => void;
  onLocationUpdate?: (location: {
    lat: number;
    lng: number;
    timestamp: string;
  }) => void;
  onStatusUpdate?: (status: string) => void;
  onProgressUpdate?: (progress: number) => void;
}

class TrackingService {
  private pusher: Pusher | null = null;
  private channels: Map<string, any> = new Map();
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {
    this.initializePusher();
  }

  private initializePusher() {
    if (typeof window === 'undefined') return;

    try {
      this.pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || '', {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
        authEndpoint: '/api/pusher/auth',
        auth: {
          headers: {
            'Content-Type': 'application/json',
          },
        },
        forceTLS: true,
        enabledTransports: ['ws', 'wss'],
      });

      this.pusher.connection.bind('connected', () => {
        console.log('✅ Tracking service connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
      });

      this.pusher.connection.bind('disconnected', () => {
        console.log('❌ Tracking service disconnected');
        this.isConnected = false;
        this.attemptReconnect();
      });

      this.pusher.connection.bind('error', (err: any) => {
        console.error('❌ Tracking service error:', err);
        this.isConnected = false;
      });
    } catch (error) {
      console.error('❌ Failed to initialize tracking service:', error);
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    setTimeout(() => {
      if (this.pusher) {
        this.pusher.connect();
      }
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  /**
   * Look up a booking by reference code or unified booking ID
   */
  async lookupBooking(
    bookingCode: string,
    includeTracking: boolean = true
  ): Promise<TrackingData | null> {
    try {
      const response = await fetch(
        `/api/track/${encodeURIComponent(bookingCode)}?tracking=${includeTracking}&realtime=true`
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null; // Booking not found
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error looking up booking:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time tracking updates for a specific booking
   */
  subscribeToBooking(bookingId: string, options: RealTimeTrackingOptions = {}) {
    if (!this.pusher || !this.isConnected) {
      console.warn('⚠️ Tracking service not connected');
      return null;
    }

    const channelName = `tracking-${bookingId}`;

    // Unsubscribe from existing channel if already subscribed
    if (this.channels.has(channelName)) {
      this.unsubscribeFromBooking(bookingId);
    }

    try {
      const channel = this.pusher.subscribe(channelName);

      // Bind to tracking events
      channel.bind('location-update', (data: any) => {
        if (options.onLocationUpdate) {
          options.onLocationUpdate({
            lat: data.lat,
            lng: data.lng,
            timestamp: data.timestamp || new Date().toISOString(),
          });
        }

        if (options.onUpdate) {
          options.onUpdate({
            type: 'location',
            bookingId,
            data,
            timestamp: new Date().toISOString(),
          });
        }
      });

      channel.bind('status-update', (data: any) => {
        if (options.onStatusUpdate) {
          options.onStatusUpdate(data.status);
        }

        if (options.onUpdate) {
          options.onUpdate({
            type: 'status',
            bookingId,
            data,
            timestamp: new Date().toISOString(),
          });
        }
      });

      channel.bind('progress-update', (data: any) => {
        if (options.onProgressUpdate) {
          options.onProgressUpdate(data.progress);
        }

        if (options.onUpdate) {
          options.onUpdate({
            type: 'progress',
            bookingId,
            data,
            timestamp: new Date().toISOString(),
          });
        }
      });

      channel.bind('eta-update', (data: any) => {
        if (options.onUpdate) {
          options.onUpdate({
            type: 'eta',
            bookingId,
            data,
            timestamp: new Date().toISOString(),
          });
        }
      });

      // Store channel reference
      this.channels.set(channelName, channel);

      console.log(`✅ Subscribed to tracking channel: ${channelName}`);
      return channel;
    } catch (error) {
      console.error('❌ Error subscribing to tracking channel:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from tracking updates for a specific booking
   */
  unsubscribeFromBooking(bookingId: string) {
    const channelName = `tracking-${bookingId}`;
    const channel = this.channels.get(channelName);

    if (channel) {
      try {
        this.pusher?.unsubscribe(channelName);
        this.channels.delete(channelName);
        console.log(`✅ Unsubscribed from tracking channel: ${channelName}`);
      } catch (error) {
        console.error('❌ Error unsubscribing from tracking channel:', error);
      }
    }
  }

  /**
   * Subscribe to admin tracking dashboard (all bookings)
   */
  subscribeToAdminTracking(options: RealTimeTrackingOptions = {}) {
    if (!this.pusher || !this.isConnected) {
      console.warn('⚠️ Tracking service not connected');
      return null;
    }

    const channelName = 'admin-tracking';

    try {
      const channel = this.pusher.subscribe(channelName);

      channel.bind('booking-update', (data: any) => {
        if (options.onUpdate) {
          options.onUpdate({
            type: 'status',
            bookingId: data.bookingId,
            data,
            timestamp: new Date().toISOString(),
          });
        }
      });

      channel.bind('driver-location-update', (data: any) => {
        if (options.onUpdate) {
          options.onUpdate({
            type: 'location',
            bookingId: data.bookingId,
            data,
            timestamp: new Date().toISOString(),
          });
        }
      });

      this.channels.set(channelName, channel);
      console.log('✅ Subscribed to admin tracking channel');
      return channel;
    } catch (error) {
      console.error('❌ Error subscribing to admin tracking channel:', error);
      return null;
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
    };
  }

  /**
   * Manually trigger a reconnection
   */
  reconnect() {
    if (this.pusher) {
      this.pusher.disconnect();
      setTimeout(() => {
        this.pusher?.connect();
      }, 1000);
    }
  }

  /**
   * Clean up all subscriptions and connections
   */
  disconnect() {
    // Unsubscribe from all channels
    this.channels.forEach((channel, channelName) => {
      try {
        this.pusher?.unsubscribe(channelName);
      } catch (error) {
        console.error('❌ Error unsubscribing from channel:', error);
      }
    });

    this.channels.clear();

    // Disconnect pusher
    if (this.pusher) {
      this.pusher.disconnect();
      this.pusher = null;
    }

    this.isConnected = false;
    console.log('✅ Tracking service disconnected');
  }
}

// Export singleton instance
export const trackingService = new TrackingService();

// Export hook for React components
export function useTrackingService() {
  return trackingService;
}
