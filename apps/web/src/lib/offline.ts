import React from 'react';
import { storeActionForSync } from './sw';

export interface OfflineAction {
  id: string;
  type: 'job_progress' | 'location_update' | 'availability_update' | 'job_claim' | 'job_decline';
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  metadata?: Record<string, any>;
}

export interface OfflineState {
  isOnline: boolean;
  lastOnline: number;
  pendingActions: OfflineAction[];
  syncInProgress: boolean;
}

class OfflineManager {
  private dbName = 'SpeedyVanOfflineDB';
  private dbVersion = 1;
  private storeName = 'offlineActions';
  private state: OfflineState = {
    isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
    lastOnline: Date.now(),
    pendingActions: [],
    syncInProgress: false
  };
  private listeners: Set<(state: OfflineState) => void> = new Set();

  constructor() {
    if (typeof window === 'undefined') {
      return;
    }
    this.init();
  }

  private async init() {
    await this.initDB();
    await this.loadPendingActions();
    this.setupEventListeners();
  }

  private async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('retryCount', 'retryCount', { unique: false });
        }
      };
    });
  }

  private async loadPendingActions() {
    try {
      const db = await this.initDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        this.state.pendingActions = request.result || [];
        this.notifyListeners();
      };
    } catch (error) {
      console.error('Failed to load pending actions:', error);
    }
  }

  private setupEventListeners() {
    if (typeof window === 'undefined') {
      return;
    }

    const updateOnlineStatus = () => {
      const wasOffline = !this.state.isOnline;
      this.state.isOnline = navigator.onLine;
      
      if (wasOffline && this.state.isOnline) {
        this.state.lastOnline = Date.now();
        this.syncPendingActions();
      }
      
      this.notifyListeners();
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  public subscribe(listener: (state: OfflineState) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getState(): OfflineState {
    return { ...this.state };
  }

  public async queueAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>): Promise<string> {
    const id = crypto.randomUUID();
    const offlineAction: OfflineAction = {
      ...action,
      id,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: action.maxRetries || 3
    };

    try {
      const db = await this.initDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      await new Promise((resolve, reject) => {
        const request = store.add(offlineAction);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      this.state.pendingActions.push(offlineAction);
      this.notifyListeners();

      // If online, try to sync immediately
      if (this.state.isOnline) {
        this.syncPendingActions();
      }

      return id;
    } catch (error) {
      console.error('Failed to queue action:', error);
      throw error;
    }
  }

  public async syncPendingActions(): Promise<void> {
    if (this.state.syncInProgress || !this.state.isOnline) {
      return;
    }

    this.state.syncInProgress = true;
    this.notifyListeners();

    try {
      const actionsToSync = [...this.state.pendingActions];
      
      for (const action of actionsToSync) {
        try {
          const success = await this.executeAction(action);
          if (success) {
            await this.removeAction(action.id);
          } else {
            action.retryCount++;
            if (action.retryCount >= action.maxRetries) {
              await this.removeAction(action.id);
              console.warn(`Action ${action.id} exceeded max retries`);
            } else {
              await this.updateAction(action);
            }
          }
        } catch (error) {
          console.error(`Failed to sync action ${action.id}:`, error);
          action.retryCount++;
          if (action.retryCount < action.maxRetries) {
            await this.updateAction(action);
          } else {
            await this.removeAction(action.id);
          }
        }
      }
    } finally {
      this.state.syncInProgress = false;
      this.notifyListeners();
    }
  }

  private async executeAction(action: OfflineAction): Promise<boolean> {
    try {
      const response = await fetch(action.url, {
        method: action.method,
        headers: action.headers,
        body: action.body
      });

      if (response.ok) {
        return true;
      }

      // Handle specific error cases
      if (response.status === 409) {
        // Conflict - action already processed
        return true;
      }

      if (response.status >= 400 && response.status < 500) {
        // Client error - don't retry
        return false;
      }

      // Server error - retry
      return false;
    } catch (error) {
      console.error(`Failed to execute action ${action.id}:`, error);
      return false;
    }
  }

  private async removeAction(id: string): Promise<void> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      await new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      this.state.pendingActions = this.state.pendingActions.filter(a => a.id !== id);
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to remove action:', error);
    }
  }

  private async updateAction(action: OfflineAction): Promise<void> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      await new Promise((resolve, reject) => {
        const request = store.put(action);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      const index = this.state.pendingActions.findIndex(a => a.id === action.id);
      if (index !== -1) {
        this.state.pendingActions[index] = action;
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to update action:', error);
    }
  }

  public async clearAllActions(): Promise<void> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      await new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      this.state.pendingActions = [];
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to clear actions:', error);
    }
  }

  public getPendingActionsByType(type: OfflineAction['type']): OfflineAction[] {
    return this.state.pendingActions.filter(action => action.type === type);
  }

  public getPendingActionsCount(): number {
    return this.state.pendingActions.length;
  }
}

// Singleton instance
export const offlineManager = new OfflineManager();

// React hook for offline state
export function useOfflineState() {
  const [state, setState] = React.useState<OfflineState>(offlineManager.getState());

  React.useEffect(() => {
    const unsubscribe = offlineManager.subscribe(setState);
    return () => {
      unsubscribe();
    };
  }, []);

  return state;
}

// Utility functions for common offline actions
export async function queueJobProgress(jobId: string, step: string, payload: any): Promise<string> {
  return offlineManager.queueAction({
    type: 'job_progress',
    url: `/api/driver/jobs/${jobId}/progress`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ step, payload }),
    maxRetries: 5,
    metadata: { jobId, step }
  });
}

export async function queueLocationUpdate(lat: number, lng: number): Promise<string> {
  return offlineManager.queueAction({
    type: 'location_update',
    url: '/api/driver/location',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lng }),
    maxRetries: 3,
    metadata: { lat, lng }
  });
}

export async function queueAvailabilityUpdate(status: string): Promise<string> {
  return offlineManager.queueAction({
    type: 'availability_update',
    url: '/api/driver/availability',
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: status }),
    maxRetries: 3,
    metadata: { status }
  });
}

export async function queueJobClaim(jobId: string): Promise<string> {
  return offlineManager.queueAction({
    type: 'job_claim',
    url: `/api/driver/jobs/${jobId}/claim`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    maxRetries: 2,
    metadata: { jobId }
  });
}

export async function queueJobDecline(jobId: string, reason?: string): Promise<string> {
  return offlineManager.queueAction({
    type: 'job_decline',
    url: `/api/driver/jobs/${jobId}/decline`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
    maxRetries: 2,
    metadata: { jobId, reason }
  });
}

// Enhanced fetch wrapper that handles offline scenarios
export async function offlineFetch(
  url: string, 
  options: RequestInit = {}, 
  actionType?: OfflineAction['type']
): Promise<Response> {
  if (!offlineManager.getState().isOnline) {
    if (actionType) {
      const actionId = await offlineManager.queueAction({
        type: actionType,
        url,
        method: options.method || 'GET',
        headers: options.headers as Record<string, string> || {},
        body: options.body ? String(options.body) : undefined,
        maxRetries: 3,
        metadata: { originalOptions: options }
      });
      
      // Return a mock response indicating the action was queued
      return new Response(JSON.stringify({ 
        queued: true, 
        actionId,
        message: 'Action queued for when connection is restored' 
      }), {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    throw new Error('No internet connection');
  }

  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    if (actionType) {
      const actionId = await offlineManager.queueAction({
        type: actionType,
        url,
        method: options.method || 'GET',
        headers: options.headers as Record<string, string> || {},
        body: options.body ? String(options.body) : undefined,
        maxRetries: 3,
        metadata: { originalOptions: options }
      });
      
      return new Response(JSON.stringify({ 
        queued: true, 
        actionId,
        message: 'Action queued due to network error' 
      }), {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    throw error;
  }
}
