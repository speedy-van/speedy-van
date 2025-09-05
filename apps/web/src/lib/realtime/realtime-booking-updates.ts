/**
 * Real-Time Booking Updates System
 *
 * This module provides real-time updates for the unified booking system,
 * including WebSocket connections, Server-Sent Events, and fallback polling.
 */

import {
  unifiedBookingApi,
  type TrackingUpdate,
} from '../api/unified-booking-api';

// ============================================================================
// REAL-TIME CONFIGURATION
// ============================================================================

const REALTIME_CONFIG = {
  websocket: {
    url: process.env.NEXT_PUBLIC_WS_URL || 'wss://api.speedy-van.co.uk/ws',
    reconnectAttempts: 5,
    reconnectDelay: 1000,
    heartbeatInterval: 30000, // 30 seconds
  },
  serverSentEvents: {
    url:
      process.env.NEXT_PUBLIC_SSE_URL || 'https://api.speedy-van.co.uk/events',
    retryTimeout: 5000,
  },
  polling: {
    interval: 10000, // 10 seconds
    maxRetries: 3,
    backoffMultiplier: 2,
  },
} as const;

// ============================================================================
// REAL-TIME TYPES
// ============================================================================

export interface RealtimeMessage {
  type:
    | 'tracking_update'
    | 'booking_status'
    | 'pricing_update'
    | 'availability_change'
    | 'system_notification';
  data: any;
  timestamp: string;
  messageId: string;
}

export interface TrackingUpdateMessage extends RealtimeMessage {
  type: 'tracking_update';
  data: TrackingUpdate;
}

export interface BookingStatusMessage extends RealtimeMessage {
  type: 'booking_status';
  data: {
    bookingId: string;
    status: string;
    estimatedArrival?: string;
    driverDetails?: {
      name: string;
      phone: string;
      vehicle: string;
    };
  };
}

export interface PricingUpdateMessage extends RealtimeMessage {
  type: 'pricing_update';
  data: {
    bookingId: string;
    newPrice: number;
    reason: string;
    breakdown: Record<string, number>;
  };
}

export interface AvailabilityChangeMessage extends RealtimeMessage {
  type: 'availability_change';
  data: {
    date: string;
    serviceType: string;
    postcode: string;
    availableSlots: Array<{
      time: string;
      available: boolean;
      priceMultiplier: number;
    }>;
  };
}

export interface SystemNotificationMessage extends RealtimeMessage {
  type: 'system_notification';
  data: {
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: 'info' | 'warning' | 'error' | 'success';
    actions?: Array<{
      label: string;
      action: string;
      url?: string;
    }>;
  };
}

export type AnyRealtimeMessage =
  | TrackingUpdateMessage
  | BookingStatusMessage
  | PricingUpdateMessage
  | AvailabilityChangeMessage
  | SystemNotificationMessage;

// ============================================================================
// REAL-TIME EVENT EMITTER
// ============================================================================

type EventCallback = (message: AnyRealtimeMessage) => void;
type EventMap = Record<string, EventCallback[]>;

class RealtimeEventEmitter {
  private events: EventMap = {};

  on(event: string, callback: EventCallback): () => void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);

    // Return unsubscribe function
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    };
  }

  emit(event: string, message: AnyRealtimeMessage): void {
    if (this.events[event]) {
      this.events[event].forEach(callback => {
        try {
          callback(message);
        } catch (error) {
          console.error('Error in event callback:', error);
        }
      });
    }
  }

  off(event: string, callback: EventCallback): void {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }

  removeAllListeners(event?: string): void {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }
}

// ============================================================================
// WEBSOCKET CONNECTION MANAGER
// ============================================================================

class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private eventEmitter: RealtimeEventEmitter;

  constructor(eventEmitter: RealtimeEventEmitter) {
    this.eventEmitter = eventEmitter;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      this.isConnecting = true;

      try {
        this.ws = new WebSocket(REALTIME_CONFIG.websocket.url);

        this.ws.onopen = () => {
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.eventEmitter.emit('connection_status', {
            status: 'connected',
          } as any);
          resolve();
        };

        this.ws.onmessage = event => {
          try {
            const message: AnyRealtimeMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = event => {
          this.isConnecting = false;
          this.stopHeartbeat();
          this.eventEmitter.emit('connection_status', {
            status: 'disconnected',
            reason: event.reason,
          } as any);

          if (
            !event.wasClean &&
            this.reconnectAttempts < REALTIME_CONFIG.websocket.reconnectAttempts
          ) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = error => {
          this.isConnecting = false;
          this.eventEmitter.emit('connection_status', {
            status: 'error',
            error,
          } as any);
          reject(error);
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }

  send(message: any): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        return false;
      }
    }
    return false;
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      this.send({ type: 'ping', timestamp: new Date().toISOString() });
    }, REALTIME_CONFIG.websocket.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay =
      REALTIME_CONFIG.websocket.reconnectDelay *
      Math.pow(2, this.reconnectAttempts - 1);

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(console.error);
    }, delay);
  }

  private handleMessage(message: AnyRealtimeMessage): void {
    // Emit the message to all listeners
    this.eventEmitter.emit(message.type, message);

    // Also emit to general message listeners
    this.eventEmitter.emit('message', message);
  }

  getConnectionStatus(): 'connecting' | 'connected' | 'disconnected' | 'error' {
    if (this.isConnecting) return 'connecting';
    if (this.ws?.readyState === WebSocket.OPEN) return 'connected';
    if (this.ws?.readyState === WebSocket.CLOSED) return 'disconnected';
    return 'error';
  }
}

// ============================================================================
// SERVER-SENT EVENTS MANAGER
// ============================================================================

class ServerSentEventsManager {
  private eventSource: EventSource | null = null;
  private eventEmitter: RealtimeEventEmitter;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(eventEmitter: RealtimeEventEmitter) {
    this.eventEmitter = eventEmitter;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.eventSource = new EventSource(
          REALTIME_CONFIG.serverSentEvents.url
        );

        this.eventSource.onopen = () => {
          this.eventEmitter.emit('connection_status', {
            status: 'connected',
            method: 'sse',
          } as any);
          resolve();
        };

        this.eventSource.onmessage = event => {
          try {
            const message: AnyRealtimeMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing SSE message:', error);
          }
        };

        this.eventSource.onerror = error => {
          this.eventEmitter.emit('connection_status', {
            status: 'error',
            method: 'sse',
            error,
          } as any);
          this.scheduleReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect().catch(console.error);
    }, REALTIME_CONFIG.serverSentEvents.retryTimeout);
  }

  private handleMessage(message: AnyRealtimeMessage): void {
    this.eventEmitter.emit(message.type, message);
    this.eventEmitter.emit('message', message);
  }
}

// ============================================================================
// POLLING FALLBACK MANAGER
// ============================================================================

class PollingFallbackManager {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private eventEmitter: RealtimeEventEmitter;
  private retryCounts: Map<string, number> = new Map();

  constructor(eventEmitter: RealtimeEventEmitter) {
    this.eventEmitter = eventEmitter;
  }

  startPolling(
    bookingId: string,
    interval = REALTIME_CONFIG.polling.interval
  ): void {
    if (this.intervals.has(bookingId)) {
      return; // Already polling
    }

    const poll = async () => {
      try {
        const response = await unifiedBookingApi.getTrackingUpdates(bookingId);
        if (response.data) {
          const latestUpdate = response.data[response.data.length - 1];
          if (latestUpdate) {
            const message: TrackingUpdateMessage = {
              type: 'tracking_update',
              data: latestUpdate,
              timestamp: new Date().toISOString(),
              messageId: `poll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            };
            this.eventEmitter.emit('tracking_update', message);
          }
        }

        // Reset retry count on success
        this.retryCounts.set(bookingId, 0);
      } catch (error) {
        const retryCount = (this.retryCounts.get(bookingId) || 0) + 1;
        this.retryCounts.set(bookingId, retryCount);

        if (retryCount >= REALTIME_CONFIG.polling.maxRetries) {
          console.error(`Max polling retries reached for booking ${bookingId}`);
          this.stopPolling(bookingId);
          return;
        }

        // Exponential backoff
        const backoffDelay =
          interval *
          Math.pow(REALTIME_CONFIG.polling.backoffMultiplier, retryCount - 1);
        setTimeout(() => poll(), backoffDelay);
      }
    };

    // Start polling immediately
    poll();

    // Set up interval
    const intervalId = setInterval(poll, interval);
    this.intervals.set(bookingId, intervalId);
  }

  stopPolling(bookingId: string): void {
    const interval = this.intervals.get(bookingId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(bookingId);
      this.retryCounts.delete(bookingId);
    }
  }

  stopAllPolling(): void {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
    this.retryCounts.clear();
  }
}

// ============================================================================
// MAIN REAL-TIME MANAGER
// ============================================================================

export class RealtimeBookingUpdates {
  private eventEmitter: RealtimeEventEmitter;
  private websocketManager: WebSocketManager;
  private sseManager: ServerSentEventsManager;
  private pollingManager: PollingFallbackManager;
  private connectionMethod: 'websocket' | 'sse' | 'polling' = 'websocket';
  private isConnected = false;
  private subscriptions: Map<string, () => void> = new Map();

  constructor() {
    this.eventEmitter = new RealtimeEventEmitter();
    this.websocketManager = new WebSocketManager(this.eventEmitter);
    this.sseManager = new ServerSentEventsManager(this.eventEmitter);
    this.pollingManager = new PollingFallbackManager(this.eventEmitter);
  }

  /**
   * Connect to real-time updates using the best available method
   */
  async connect(): Promise<void> {
    try {
      // Try WebSocket first
      await this.websocketManager.connect();
      this.connectionMethod = 'websocket';
      this.isConnected = true;
      this.eventEmitter.emit('connection_status', {
        status: 'connected',
        method: 'websocket',
      } as any);
    } catch (error) {
      console.warn('WebSocket connection failed, trying SSE:', error);

      try {
        // Fallback to Server-Sent Events
        await this.sseManager.connect();
        this.connectionMethod = 'sse';
        this.isConnected = true;
        this.eventEmitter.emit('connection_status', {
          status: 'connected',
          method: 'sse',
        } as any);
      } catch (sseError) {
        console.warn(
          'SSE connection failed, using polling fallback:',
          sseError
        );

        // Fallback to polling
        this.connectionMethod = 'polling';
        this.isConnected = true;
        this.eventEmitter.emit('connection_status', {
          status: 'connected',
          method: 'polling',
        } as any);
      }
    }
  }

  /**
   * Disconnect from real-time updates
   */
  disconnect(): void {
    this.websocketManager.disconnect();
    this.sseManager.disconnect();
    this.pollingManager.stopAllPolling();
    this.isConnected = false;

    // Clear all subscriptions
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions.clear();

    this.eventEmitter.emit('connection_status', {
      status: 'disconnected',
    } as any);
  }

  /**
   * Subscribe to tracking updates for a specific booking
   */
  subscribeToTracking(
    bookingId: string,
    callback: (update: TrackingUpdate) => void
  ): () => void {
    // If using polling fallback, start polling for this booking
    if (this.connectionMethod === 'polling') {
      this.pollingManager.startPolling(bookingId);
    }

    // Subscribe to tracking updates
    const unsubscribe = this.eventEmitter.on('tracking_update', message => {
      if (message.type === 'tracking_update' && message.data.bookingId === bookingId) {
        callback(message.data);
      }
    });

    // Store subscription for cleanup
    this.subscriptions.set(bookingId, unsubscribe);

    // Return unsubscribe function
    return () => {
      unsubscribe();
      this.subscriptions.delete(bookingId);

      // If using polling, stop polling for this booking
      if (this.connectionMethod === 'polling') {
        this.pollingManager.stopPolling(bookingId);
      }
    };
  }

  /**
   * Subscribe to booking status updates
   */
  subscribeToBookingStatus(
    bookingId: string,
    callback: (status: BookingStatusMessage['data']) => void
  ): () => void {
    const unsubscribe = this.eventEmitter.on('booking_status', message => {
      if (message.type === 'booking_status' && message.data.bookingId === bookingId) {
        callback(message.data);
      }
    });

    this.subscriptions.set(`status_${bookingId}`, unsubscribe);
    return unsubscribe;
  }

  /**
   * Subscribe to pricing updates
   */
  subscribeToPricingUpdates(
    bookingId: string,
    callback: (update: PricingUpdateMessage['data']) => void
  ): () => void {
    const unsubscribe = this.eventEmitter.on('pricing_update', message => {
      if (message.type === 'pricing_update' && message.data.bookingId === bookingId) {
        callback(message.data);
      }
    });

    this.subscriptions.set(`pricing_${bookingId}`, unsubscribe);
    return unsubscribe;
  }

  /**
   * Subscribe to availability changes
   */
  subscribeToAvailabilityChanges(
    callback: (change: AvailabilityChangeMessage['data']) => void
  ): () => void {
    return this.eventEmitter.on('availability_change', message => {
      if (message.type === 'availability_change') {
        callback(message.data);
      }
    });
  }

  /**
   * Subscribe to system notifications
   */
  subscribeToSystemNotifications(
    callback: (notification: SystemNotificationMessage['data']) => void
  ): () => void {
    return this.eventEmitter.on('system_notification', message => {
      if (message.type === 'system_notification') {
        callback(message.data);
      }
    });
  }

  /**
   * Subscribe to connection status changes
   */
  subscribeToConnectionStatus(
    callback: (status: {
      status: string;
      method?: string;
      reason?: string;
    }) => void
  ): () => void {
    return this.eventEmitter.on('connection_status', (message: any) => {
      callback(message);
    });
  }

  /**
   * Subscribe to all messages
   */
  subscribeToAllMessages(
    callback: (message: AnyRealtimeMessage) => void
  ): () => void {
    return this.eventEmitter.on('message', callback);
  }

  /**
   * Send a message (only works with WebSocket)
   */
  send(message: any): boolean {
    if (this.connectionMethod === 'websocket') {
      return this.websocketManager.send(message);
    }
    return false;
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): { isConnected: boolean; method: string } {
    return {
      isConnected: this.isConnected,
      method: this.connectionMethod,
    };
  }

  /**
   * Get connection statistics
   */
  getConnectionStats(): {
    totalSubscriptions: number;
    activeConnections: number;
    connectionMethod: string;
  } {
    return {
      totalSubscriptions: this.subscriptions.size,
      activeConnections: this.isConnected ? 1 : 0,
      connectionMethod: this.connectionMethod,
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Create singleton instance
export const realtimeBookingUpdates = new RealtimeBookingUpdates();

// Export classes for testing
export {
  RealtimeEventEmitter,
  WebSocketManager,
  ServerSentEventsManager,
  PollingFallbackManager,
};
