// Typed API Client for Speedy Van Admin Dashboard
// Provides type-safe functions for all admin API endpoints

import {
  // Orders
  Order,
  OrderFilters,
  OrderUpdateRequest,
  DriverAssignmentRequest,
  AssignmentSuggestionsResponse,
  OrdersListResponse,
  
  // Refunds
  Refund,
  CreateRefundRequest,
  RefundFilters,
  RefundsListResponse,
  
  // Drivers
  Driver,
  DriverFilters,
  ApproveDriverRequest,
  RejectDriverRequest,
  UpdateDriverRequest,
  DriversListResponse,
  
  // Configuration
  
  // Analytics
  AnalyticsSummary,
  AnalyticsRange,
  
  // Common
  ApiResponse,
  ApiError as ApiContractError
} from '@/types/api-contracts';

// ============================================================================
// Base API Client
// ============================================================================

class ApiClient {
  private baseUrl: string;
  private sessionToken?: string;

  constructor(baseUrl: string = '/api/admin') {
    this.baseUrl = baseUrl;
  }

  setSessionToken(token: string) {
    this.sessionToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.sessionToken) {
      (headers as any)['Cookie'] = `session=${this.sessionToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`
      }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  private async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(endpoint, this.baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    return this.request<T>(url.pathname + url.search);
  }

  private async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  private async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  private async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // Orders Management
  // ============================================================================

  /**
   * List orders with filtering and pagination
   */
  async getOrders(filters?: OrderFilters): Promise<OrdersListResponse> {
    return this.get<OrdersListResponse>('/orders', filters);
  }

  /**
   * Get detailed order information by code
   */
  async getOrder(reference: string): Promise<Order> {
    return this.get<Order>(`/orders/${reference}`);
  }

  /**
   * Update order details (status, driver, time, notes)
   */
  async updateOrder(reference: string, data: OrderUpdateRequest): Promise<Order> {
    return this.put<Order>(`/orders/${reference}`, data);
  }

  /**
   * Assign driver to order (manual or auto-assign)
   */
  async assignDriver(reference: string, data: DriverAssignmentRequest): Promise<Order> {
    return this.post<Order>(`/orders/${reference}/assign`, data);
  }

  /**
   * Get driver assignment suggestions for an order
   */
  async getAssignmentSuggestions(reference: string): Promise<AssignmentSuggestionsResponse> {
    return this.get<AssignmentSuggestionsResponse>(`/orders/${reference}/assign`);
  }

  // ============================================================================
  // Refunds Management
  // ============================================================================

  /**
   * Create a refund for a payment
   */
  async createRefund(data: CreateRefundRequest): Promise<Refund> {
    return this.post<Refund>('/refunds', data);
  }

  /**
   * List refunds with filtering
   */
  async getRefunds(filters?: RefundFilters): Promise<RefundsListResponse> {
    return this.get<RefundsListResponse>('/refunds', filters);
  }

  // ============================================================================
  // Drivers Management
  // ============================================================================

  /**
   * List driver applications with filtering
   */
  async getDriverApplications(filters?: DriverFilters): Promise<DriversListResponse> {
    return this.get<DriversListResponse>('/drivers/applications', filters);
  }

  /**
   * Approve a driver application
   */
  async approveDriver(driverId: string, data: ApproveDriverRequest): Promise<Driver> {
    return this.post<Driver>(`/drivers/${driverId}/approve`, data);
  }

  /**
   * Reject a driver application
   */
  async rejectDriver(driverId: string, data: RejectDriverRequest): Promise<Driver> {
    return this.post<Driver>(`/drivers/${driverId}/reject`, data);
  }

  /**
   * Get detailed driver information
   */
  async getDriver(driverId: string): Promise<Driver> {
    return this.get<Driver>(`/drivers/${driverId}`);
  }

  /**
   * Update driver status and details
   */
  async updateDriver(driverId: string, data: UpdateDriverRequest): Promise<Driver> {
    return this.put<Driver>(`/drivers/${driverId}`, data);
  }

  // ============================================================================
  // Configuration Management
  // ============================================================================



  // ============================================================================
  // Analytics
  // ============================================================================

  /**
   * Get analytics summary data
   */
  async getAnalyticsSummary(range?: AnalyticsRange): Promise<AnalyticsSummary> {
    return this.get<AnalyticsSummary>('/analytics/summary', { range });
  }

  // ============================================================================
  // Bulk Operations
  // ============================================================================

  /**
   * Bulk assign drivers to orders
   */
  async bulkAssignDrivers(orders: string[], driverId?: string, autoAssign = false): Promise<Order[]> {
    return this.post<Order[]>('/orders/bulk/assign', {
      orders,
      driverId,
      autoAssign,
    });
  }

  /**
   * Bulk update order status
   */
  async bulkUpdateOrders(orders: string[], status: string, reason?: string): Promise<Order[]> {
    return this.put<Order[]>('/orders/bulk/update', {
      orders,
      status,
      reason,
    });
  }

  // ============================================================================
  // Export Operations
  // ============================================================================

  /**
   * Export orders to CSV
   */
  async exportOrders(filters?: OrderFilters): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/orders/export?${new URLSearchParams(filters as Record<string, string>)}`, {
      headers: this.sessionToken ? { 'Cookie': `session=${this.sessionToken}` } : {},
    });
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }
    
    return response.blob();
  }

  /**
   * Export refunds to CSV
   */
  async exportRefunds(filters?: RefundFilters): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/refunds/export?${new URLSearchParams(filters as Record<string, string>)}`, {
      headers: this.sessionToken ? { 'Cookie': `session=${this.sessionToken}` } : {},
    });
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }
    
    return response.blob();
  }

  // ============================================================================
  // Real-time Operations
  // ============================================================================

  /**
   * Get real-time order updates via Server-Sent Events
   */
  subscribeToOrderUpdates(callback: (order: Order) => void): () => void {
    const eventSource = new EventSource(`${this.baseUrl}/orders/stream`);
    
    eventSource.onmessage = (event) => {
      try {
        const order: Order = JSON.parse(event.data);
        callback(order);
      } catch (error) {
        console.error('Error parsing order update:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
    };

    // Return cleanup function
    return () => {
      eventSource.close();
    };
  }

  /**
   * Get real-time driver location updates
   */
  subscribeToDriverLocations(callback: (location: { driverId: string; lat: number; lng: number }) => void): () => void {
    const eventSource = new EventSource(`${this.baseUrl}/drivers/locations/stream`);
    
    eventSource.onmessage = (event) => {
      try {
        const location = JSON.parse(event.data);
        callback(location);
      } catch (error) {
        console.error('Error parsing location update:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
    };

    return () => {
      eventSource.close();
    };
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

// Create a singleton instance for use throughout the application
export const apiClient = new ApiClient();

// ============================================================================
// Hook for React Components
// ============================================================================

import { useCallback } from 'react';

export function useApiClient() {
  const setSessionToken = useCallback((token: string) => {
    apiClient.setSessionToken(token);
  }, []);

  return {
    apiClient,
    setSessionToken,
  };
}

// ============================================================================
// Error Handling Utilities
// ============================================================================

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: Record<string, string>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: any): never {
  if (error instanceof ApiError) {
    throw error;
  }
  
  if (error instanceof Error) {
    throw new ApiError(error.message, 500);
  }
  
  throw new ApiError('Unknown error occurred', 500);
}

// ============================================================================
// Rate Limiting Utilities
// ============================================================================

export function parseRateLimitHeaders(headers: Headers): {
  limit: number;
  remaining: number;
  reset: number;
} {
  return {
    limit: parseInt(headers.get('X-RateLimit-Limit') || '0'),
    remaining: parseInt(headers.get('X-RateLimit-Remaining') || '0'),
    reset: parseInt(headers.get('X-RateLimit-Reset') || '0'),
  };
}

// ============================================================================
// Validation Utilities
// ============================================================================

export function validateOrderFilters(filters: OrderFilters): boolean {
  if (filters.take && (filters.take < 1 || filters.take > 200)) {
    throw new Error('Take must be between 1 and 200');
  }
  
  if (filters.dateRange && !['today', 'week', 'month'].includes(filters.dateRange)) {
    throw new Error('Invalid date range');
  }
  
  return true;
}

export function validateRefundRequest(request: CreateRefundRequest): boolean {
  if (!request.paymentId) {
    throw new Error('Payment ID is required');
  }
  
  if (!request.amount || request.amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }
  
  if (!request.reason) {
    throw new Error('Reason is required');
  }
  
  return true;
}

// ============================================================================
// Default Export
// ============================================================================

export default apiClient;
