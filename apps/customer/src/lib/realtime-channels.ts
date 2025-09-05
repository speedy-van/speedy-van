'use client';
import { createPusherClient, createPublicPusherClient } from './pusher-client';

// Channel namespacing for multi-tenant support
export const CHANNEL_NAMESPACES = {
  ORDERS: 'orders',
  DRIVERS: 'drivers',
  DISPATCH: 'dispatch',
  FINANCE: 'finance',
  CUSTOMERS: 'customers',
  JOBS: 'jobs',
  NOTIFICATIONS: 'notifications',
} as const;

// Channel event types for type safety
export const CHANNEL_EVENTS = {
  // Orders
  ORDER_CREATED: 'order.created',
  ORDER_UPDATED: 'order.updated',
  ORDER_STATUS_CHANGED: 'order.status_changed',
  ORDER_ASSIGNED: 'order.assigned',
  ORDER_CANCELLED: 'order.cancelled',

  // Drivers
  DRIVER_ONLINE: 'driver.online',
  DRIVER_OFFLINE: 'driver.offline',
  DRIVER_LOCATION: 'driver.location',
  DRIVER_STATUS: 'driver.status',
  DRIVER_APPROVED: 'driver.approved',
  DRIVER_SUSPENDED: 'driver.suspended',

  // Dispatch
  JOB_OFFERED: 'job.offered',
  JOB_CLAIMED: 'job.claimed',
  JOB_STARTED: 'job.started',
  JOB_COMPLETED: 'job.completed',
  JOB_CANCELLED: 'job.cancelled',

  // Finance
  PAYMENT_RECEIVED: 'payment.received',
  PAYMENT_FAILED: 'payment.failed',
  REFUND_ISSUED: 'refund.issued',
  PAYOUT_PROCESSED: 'payout.processed',

  // Notifications
  NOTIFICATION_SENT: 'notification.sent',
  NOTIFICATION_READ: 'notification.read',
} as const;

// Channel configuration with fallback polling
export interface ChannelConfig {
  namespace: keyof typeof CHANNEL_NAMESPACES;
  channelId?: string;
  requiresAuth?: boolean;
  pollingInterval?: number; // ms, for fallback when Pusher is down
  maxReconnectAttempts?: number;
  reconnectDelay?: number; // ms
}

// Event handler type
export type EventHandler<T = any> = (data: T) => void;

// Connection state
export type ConnectionState =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting'
  | 'error';

// Channel subscription interface
export interface ChannelSubscription {
  channel: string;
  event: string;
  handler: EventHandler;
  unsubscribe: () => void;
}

// Real-time manager class
export class RealtimeManager {
  private pusher: any = null;
  private publicPusher: any = null;
  private subscriptions: Map<string, ChannelSubscription[]> = new Map();
  private connectionState: ConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private eventHandlers: Map<string, EventHandler[]> = new Map();
  private connectionStateHandlers: ((state: ConnectionState) => void)[] = [];

  constructor(
    private config: {
      maxReconnectAttempts?: number;
      reconnectDelay?: number;
      enablePolling?: boolean;
    } = {}
  ) {
    this.maxReconnectAttempts = config.maxReconnectAttempts || 5;
    this.reconnectDelay = config.reconnectDelay || 1000;
  }

  // Initialize Pusher connections
  async initialize() {
    try {
      // Initialize authenticated client
      this.pusher = await createPusherClient({
        authEndpoint: '/api/pusher/auth',
        auth: {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      });

      // Initialize public client for non-authenticated channels
      this.publicPusher = await createPublicPusherClient();

      this.setupConnectionHandlers();
      this.connectionState = 'connected';
      this.notifyConnectionStateChange();

      console.log('RealtimeManager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize RealtimeManager:', error);
      this.connectionState = 'error';
      this.notifyConnectionStateChange();
      throw error;
    }
  }

  // Setup connection event handlers
  private setupConnectionHandlers() {
    if (!this.pusher) return;

    this.pusher.connection.bind('connected', () => {
      console.log('Pusher connected');
      this.connectionState = 'connected';
      this.reconnectAttempts = 0;
      this.notifyConnectionStateChange();
      this.resubscribeAll();
    });

    this.pusher.connection.bind('disconnected', () => {
      console.log('Pusher disconnected');
      this.connectionState = 'disconnected';
      this.notifyConnectionStateChange();
      this.startPollingFallback();
    });

    this.pusher.connection.bind('reconnecting', () => {
      console.log('Pusher reconnecting...');
      this.connectionState = 'reconnecting';
      this.notifyConnectionStateChange();
    });

    this.pusher.connection.bind('error', (error: any) => {
      console.error('Pusher connection error:', error);
      this.connectionState = 'error';
      this.notifyConnectionStateChange();

      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect();
      }
    });
  }

  // Subscribe to a channel with event handling
  subscribe<T = any>(
    config: ChannelConfig,
    event: string,
    handler: EventHandler<T>
  ): () => void {
    const channelName = this.buildChannelName(config);
    const subscriptionKey = `${channelName}:${event}`;

    // Store handler
    if (!this.eventHandlers.has(subscriptionKey)) {
      this.eventHandlers.set(subscriptionKey, []);
    }
    this.eventHandlers.get(subscriptionKey)!.push(handler);

    // Subscribe to Pusher if connected
    if (this.connectionState === 'connected') {
      this.subscribeToPusher(channelName, event, handler);
    }

    // Setup polling fallback if configured
    if (config.pollingInterval && this.config.enablePolling !== false) {
      this.setupPollingFallback(channelName, event, config.pollingInterval);
    }

    // Return unsubscribe function
    return () => {
      this.unsubscribe(channelName, event, handler);
    };
  }

  // Build channel name with namespace
  private buildChannelName(config: ChannelConfig): string {
    const namespace = CHANNEL_NAMESPACES[config.namespace];
    return config.channelId ? `${namespace}-${config.channelId}` : namespace;
  }

  // Subscribe to Pusher channel
  private subscribeToPusher(
    channelName: string,
    event: string,
    handler: EventHandler
  ) {
    try {
      const client = this.pusher || this.publicPusher;
      if (!client) return;

      const channel = client.subscribe(channelName);

      channel.bind(event, (data: any) => {
        try {
          handler(data);
        } catch (error) {
          console.error(
            `Error in event handler for ${channelName}:${event}:`,
            error
          );
        }
      });

      // Store subscription
      const subscription: ChannelSubscription = {
        channel: channelName,
        event,
        handler,
        unsubscribe: () => {
          channel.unbind(event, handler);
          client.unsubscribe(channelName);
        },
      };

      if (!this.subscriptions.has(channelName)) {
        this.subscriptions.set(channelName, []);
      }
      this.subscriptions.get(channelName)!.push(subscription);
    } catch (error) {
      console.error(`Failed to subscribe to ${channelName}:${event}:`, error);
    }
  }

  // Unsubscribe from channel
  private unsubscribe(
    channelName: string,
    event: string,
    handler: EventHandler
  ) {
    const subscriptionKey = `${channelName}:${event}`;

    // Remove handler
    const handlers = this.eventHandlers.get(subscriptionKey);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
      if (handlers.length === 0) {
        this.eventHandlers.delete(subscriptionKey);
      }
    }

    // Unsubscribe from Pusher
    const subscriptions = this.subscriptions.get(channelName);
    if (subscriptions) {
      const subscription = subscriptions.find(
        s => s.event === event && s.handler === handler
      );
      if (subscription) {
        subscription.unsubscribe();
        const index = subscriptions.indexOf(subscription);
        if (index > -1) {
          subscriptions.splice(index, 1);
        }
      }
    }

    // Clear polling interval
    this.clearPollingInterval(channelName, event);
  }

  // Setup polling fallback
  private setupPollingFallback(
    channelName: string,
    event: string,
    interval: number
  ) {
    const key = `${channelName}:${event}`;

    // Clear existing interval
    this.clearPollingInterval(channelName, event);

    // Setup new interval
    const timeoutId = setInterval(async () => {
      if (
        this.connectionState === 'disconnected' ||
        this.connectionState === 'error'
      ) {
        try {
          await this.pollForUpdates(channelName, event);
        } catch (error) {
          console.error(`Polling error for ${key}:`, error);
        }
      }
    }, interval);

    this.pollingIntervals.set(key, timeoutId);
  }

  // Poll for updates when Pusher is down
  private async pollForUpdates(channelName: string, event: string) {
    const subscriptionKey = `${channelName}:${event}`;
    const handlers = this.eventHandlers.get(subscriptionKey);

    if (!handlers || handlers.length === 0) return;

    try {
      // Make API call to get latest data
      const response = await fetch(
        `/api/realtime/poll?channel=${channelName}&event=${event}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.hasUpdate) {
          handlers.forEach(handler => {
            try {
              handler(data.payload);
            } catch (error) {
              console.error('Error in polling handler:', error);
            }
          });
        }
      }
    } catch (error) {
      console.error(`Polling failed for ${subscriptionKey}:`, error);
    }
  }

  // Clear polling interval
  private clearPollingInterval(channelName: string, event: string) {
    const key = `${channelName}:${event}`;
    const timeoutId = this.pollingIntervals.get(key);
    if (timeoutId) {
      clearInterval(timeoutId);
      this.pollingIntervals.delete(key);
    }
  }

  // Start polling fallback when Pusher is disconnected
  private startPollingFallback() {
    this.eventHandlers.forEach((handlers, key) => {
      if (handlers.length > 0) {
        const [channelName, event] = key.split(':');
        // Use default polling interval of 30 seconds
        this.setupPollingFallback(channelName, event, 30000);
      }
    });
  }

  // Resubscribe to all channels after reconnection
  private resubscribeAll() {
    this.eventHandlers.forEach((handlers, key) => {
      if (handlers.length > 0) {
        const [channelName, event] = key.split(':');
        handlers.forEach(handler => {
          this.subscribeToPusher(channelName, event, handler);
        });
      }
    });
  }

  // Schedule reconnection with exponential backoff
  private scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      if (
        this.connectionState === 'disconnected' ||
        this.connectionState === 'error'
      ) {
        this.initialize();
      }
    }, delay);
  }

  // Get current connection state
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  // Subscribe to connection state changes
  onConnectionStateChange(
    handler: (state: ConnectionState) => void
  ): () => void {
    this.connectionStateHandlers.push(handler);
    return () => {
      const index = this.connectionStateHandlers.indexOf(handler);
      if (index > -1) {
        this.connectionStateHandlers.splice(index, 1);
      }
    };
  }

  // Notify connection state change
  private notifyConnectionStateChange() {
    this.connectionStateHandlers.forEach(handler => {
      try {
        handler(this.connectionState);
      } catch (error) {
        console.error('Error in connection state handler:', error);
      }
    });
  }

  // Disconnect and cleanup
  disconnect() {
    // Clear all polling intervals
    this.pollingIntervals.forEach(timeoutId => {
      clearInterval(timeoutId);
    });
    this.pollingIntervals.clear();

    // Unsubscribe from all Pusher channels
    this.subscriptions.forEach(subscriptions => {
      subscriptions.forEach(subscription => {
        subscription.unsubscribe();
      });
    });
    this.subscriptions.clear();

    // Disconnect Pusher
    if (this.pusher) {
      this.pusher.disconnect();
      this.pusher = null;
    }
    if (this.publicPusher) {
      this.publicPusher.disconnect();
      this.publicPusher = null;
    }

    this.connectionState = 'disconnected';
    this.notifyConnectionStateChange();
  }
}

// Global realtime manager instance
let globalRealtimeManager: RealtimeManager | null = null;

// Get or create global realtime manager
export function getRealtimeManager(
  config?: ConstructorParameters<typeof RealtimeManager>[0]
): RealtimeManager {
  if (!globalRealtimeManager) {
    globalRealtimeManager = new RealtimeManager(config);
  }
  return globalRealtimeManager;
}

// Initialize global realtime manager
export async function initializeRealtime(
  config?: ConstructorParameters<typeof RealtimeManager>[0]
): Promise<RealtimeManager> {
  const manager = getRealtimeManager(config);
  await manager.initialize();
  return manager;
}

// Utility functions for common subscriptions
export const realtimeUtils = {
  // Subscribe to order updates
  subscribeToOrder: (orderId: string, handler: EventHandler) => {
    const manager = getRealtimeManager();
    return manager.subscribe(
      { namespace: 'ORDERS', channelId: orderId, pollingInterval: 30000 },
      CHANNEL_EVENTS.ORDER_UPDATED,
      handler
    );
  },

  // Subscribe to driver updates
  subscribeToDriver: (driverId: string, handler: EventHandler) => {
    const manager = getRealtimeManager();
    return manager.subscribe(
      { namespace: 'DRIVERS', channelId: driverId, pollingInterval: 30000 },
      CHANNEL_EVENTS.DRIVER_STATUS,
      handler
    );
  },

  // Subscribe to dispatch updates
  subscribeToDispatch: (handler: EventHandler) => {
    const manager = getRealtimeManager();
    return manager.subscribe(
      { namespace: 'DISPATCH', pollingInterval: 15000 },
      CHANNEL_EVENTS.JOB_OFFERED,
      handler
    );
  },

  // Subscribe to finance updates
  subscribeToFinance: (handler: EventHandler) => {
    const manager = getRealtimeManager();
    return manager.subscribe(
      { namespace: 'FINANCE', pollingInterval: 60000 },
      CHANNEL_EVENTS.PAYMENT_RECEIVED,
      handler
    );
  },
};
