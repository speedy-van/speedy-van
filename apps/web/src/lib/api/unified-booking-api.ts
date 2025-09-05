/**
 * Unified Booking System API Integration
 *
 * This module provides a complete API layer for the unified booking system,
 * including real-time updates, error handling, and analytics tracking.
 */

import type { UnifiedBookingData } from '../unified-booking-context';
import type { PricingRequest, PricingResponse } from '../pricing/engine';
import type { ApiResponse } from '../../types/api-contracts';
import { 
  Coordinates, 
  Address, 
  PropertyDetails, 
  BookingItem, 
  TimeSlot, 
  ServiceType 
} from '../booking-schemas';

// ============================================================================
// API CONFIGURATION
// ============================================================================

const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.speedy-van.co.uk',
  endpoints: {
    bookings: '/api/bookings',
    pricing: '/api/pricing',
    availability: '/api/availability',
    tracking: '/api/tracking',
    analytics: '/api/analytics',
  },
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
} as const;

// ============================================================================
// API TYPES
// ============================================================================

// ApiResponse imported from ../../types/api-contracts

export interface BookingCreateRequest {
  bookingData: UnifiedBookingData;
  customerId?: string;
  source: 'web' | 'mobile' | 'admin';
  utmData?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
}

export interface BookingCreateResponse {
  bookingId: string;
  reference: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  estimatedPrice: number;
  estimatedDuration: number;
  nextSteps: string[];
  paymentUrl?: string;
}

// PricingRequest and PricingResponse imported from ../pricing/engine

export interface AvailabilityRequest {
  date: string;
  serviceType: string;
  postcode: string;
}

export interface AvailabilityResponse {
  availableSlots: Array<{
    time: string;
    available: boolean;
    priceMultiplier: number;
    estimatedWait: number;
  }>;
  nextAvailableDate?: string;
  recommendations: string[];
}

export interface TrackingUpdate {
  bookingId: string;
  status: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  estimatedArrival?: string;
  driverDetails?: {
    name: string;
    phone: string;
    vehicle: string;
  };
  notes?: string;
  timestamp: string;
}

// ============================================================================
// API CLIENT CLASS
// ============================================================================

class UnifiedBookingApiClient {
  private baseUrl: string;
  private timeout: number;
  private retryAttempts: number;
  private retryDelay: number;

  constructor(config = API_CONFIG) {
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout;
    this.retryAttempts = config.retryAttempts;
    this.retryDelay = config.retryDelay;
  }

  /**
   * Make HTTP request with retry logic and error handling
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': this.generateRequestId(),
          'X-Client-Version': 'unified-booking-v1.0.0',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as ApiResponse<T>;
    } catch (error) {
      clearTimeout(timeoutId);

      // Retry logic for network errors
      if (retryCount < this.retryAttempts && this.isRetryableError(error)) {
        await this.delay(this.retryDelay * Math.pow(2, retryCount));
        return this.makeRequest<T>(endpoint, options, retryCount + 1);
      }

      // Log error for analytics
      this.logError(error, endpoint, options);

      return {
        success: false,
        error: this.getErrorMessage(error),
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
      };
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    if (error.name === 'AbortError') return false;
    if (error.message?.includes('HTTP 4')) return false; // Don't retry client errors
    if (error.message?.includes('HTTP 5')) return true; // Retry server errors
    return true; // Retry network errors
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: any): string {
    if (error.name === 'AbortError') {
      return 'Request timed out. Please try again.';
    }
    if (error.message?.includes('HTTP 429')) {
      return 'Too many requests. Please wait a moment and try again.';
    }
    if (error.message?.includes('HTTP 500')) {
      return 'Server error. Please try again later.';
    }
    if (error.message?.includes('HTTP 503')) {
      return 'Service temporarily unavailable. Please try again later.';
    }
    return error.message || 'An unexpected error occurred. Please try again.';
  }

  /**
   * Log error for analytics
   */
  private logError(error: any, endpoint: string, options: RequestInit) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'api_error', {
        endpoint,
        method: options.method || 'GET',
        error_message: error.message,
        error_name: error.name,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // ============================================================================
  // BOOKING API METHODS
  // ============================================================================

  /**
   * Create a new booking
   */
  async createBooking(
    request: BookingCreateRequest
  ): Promise<ApiResponse<BookingCreateResponse>> {
    return this.makeRequest<BookingCreateResponse>(
      API_CONFIG.endpoints.bookings,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * Get booking details
   */
  async getBooking(bookingId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`${API_CONFIG.endpoints.bookings}/${bookingId}`);
  }

  /**
   * Update booking
   */
  async updateBooking(
    bookingId: string,
    updates: Partial<UnifiedBookingData>
  ): Promise<ApiResponse<any>> {
    return this.makeRequest(`${API_CONFIG.endpoints.bookings}/${bookingId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Cancel booking
   */
  async cancelBooking(
    bookingId: string,
    reason?: string
  ): Promise<ApiResponse<any>> {
    return this.makeRequest(
      `${API_CONFIG.endpoints.bookings}/${bookingId}/cancel`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }
    );
  }

  // ============================================================================
  // PRICING API METHODS
  // ============================================================================

  /**
   * Get pricing estimate
   */
  async getPricing(
    request: PricingRequest
  ): Promise<ApiResponse<PricingResponse>> {
    return this.makeRequest<PricingResponse>(API_CONFIG.endpoints.pricing, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get real-time pricing with caching
   */
  async getCachedPricing(
    request: PricingRequest
  ): Promise<ApiResponse<PricingResponse>> {
    const cacheKey = this.generatePricingCacheKey(request);
    const cached = this.getPricingFromCache(cacheKey);

    if (cached && this.isPricingCacheValid(cached)) {
      return {
        success: true,
        data: cached.data,
        timestamp: cached.timestamp,
        requestId: this.generateRequestId(),
      };
    }

    const response = await this.getPricing(request);
    if (response.success && response.data) {
      this.setPricingCache(cacheKey, response);
    }

    return response;
  }

  // ============================================================================
  // AVAILABILITY API METHODS
  // ============================================================================

  /**
   * Check availability for a specific date and service
   */
  async checkAvailability(
    request: AvailabilityRequest
  ): Promise<ApiResponse<AvailabilityResponse>> {
    return this.makeRequest<AvailabilityResponse>(
      API_CONFIG.endpoints.availability,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * Get availability for multiple dates
   */
  async getAvailabilityRange(
    startDate: string,
    endDate: string,
    serviceType: string,
    postcode: string
  ): Promise<ApiResponse<Record<string, AvailabilityResponse>>> {
    return this.makeRequest<Record<string, AvailabilityResponse>>(
      `${API_CONFIG.endpoints.availability}/range`,
      {
        method: 'POST',
        body: JSON.stringify({
          startDate,
          endDate,
          serviceType,
          postcode,
        }),
      }
    );
  }

  // ============================================================================
  // TRACKING API METHODS
  // ============================================================================

  /**
   * Get real-time tracking updates
   */
  async getTrackingUpdates(
    bookingId: string
  ): Promise<ApiResponse<TrackingUpdate[]>> {
    return this.makeRequest<TrackingUpdate[]>(
      `${API_CONFIG.endpoints.tracking}/${bookingId}/updates`
    );
  }

  /**
   * Subscribe to real-time tracking updates
   */
  subscribeToTracking(
    bookingId: string,
    callback: (update: TrackingUpdate) => void
  ): () => void {
    // Implementation would use WebSocket or Server-Sent Events
    // For now, we'll simulate with polling
    const interval = setInterval(async () => {
      try {
        const response = await this.getTrackingUpdates(bookingId);
        if (response.success && response.data) {
          const latestUpdate = response.data[response.data.length - 1];
          if (latestUpdate) {
            callback(latestUpdate);
          }
        }
      } catch (error) {
        console.error('Tracking subscription error:', error);
      }
    }, 10000); // Poll every 10 seconds

    // Return unsubscribe function
    return () => clearInterval(interval);
  }

  // ============================================================================
  // ANALYTICS API METHODS
  // ============================================================================

  /**
   * Track booking step completion
   */
  async trackStepCompletion(
    step: number,
    stepData: any,
    sessionId: string
  ): Promise<ApiResponse<void>> {
    return this.makeRequest(`${API_CONFIG.endpoints.analytics}/steps`, {
      method: 'POST',
      body: JSON.stringify({
        step,
        stepData,
        sessionId,
        timestamp: new Date().toISOString(),
      }),
    });
  }

  /**
   * Track booking abandonment
   */
  async trackAbandonment(
    step: number,
    reason: string,
    sessionId: string,
    partialData?: Partial<UnifiedBookingData>
  ): Promise<ApiResponse<void>> {
    return this.makeRequest(`${API_CONFIG.endpoints.analytics}/abandonment`, {
      method: 'POST',
      body: JSON.stringify({
        step,
        reason,
        sessionId,
        partialData,
        timestamp: new Date().toISOString(),
      }),
    });
  }

  /**
   * Track booking completion
   */
  async trackCompletion(
    bookingId: string,
    sessionId: string,
    totalTime: number,
    stepsCompleted: number[]
  ): Promise<ApiResponse<void>> {
    return this.makeRequest(`${API_CONFIG.endpoints.analytics}/completion`, {
      method: 'POST',
      body: JSON.stringify({
        bookingId,
        sessionId,
        totalTime,
        stepsCompleted,
        timestamp: new Date().toISOString(),
      }),
    });
  }

  // ============================================================================
  // CACHING METHODS
  // ============================================================================

  private generatePricingCacheKey(request: PricingRequest): string {
    return `pricing_${JSON.stringify(request)}`;
  }

  private getPricingFromCache(key: string): any {
    try {
      const cached = localStorage.getItem(`api_cache_${key}`);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }

  private setPricingCache(
    key: string,
    response: ApiResponse<PricingResponse>
  ): void {
    try {
      const cacheData = {
        data: response.data,
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
      };
      localStorage.setItem(`api_cache_${key}`, JSON.stringify(cacheData));
    } catch {
      // Ignore cache errors
    }
  }

  private isPricingCacheValid(cached: any): boolean {
    try {
      const expiresAt = new Date(cached.expiresAt);
      return new Date() < expiresAt;
    } catch {
      return false;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get API health status
   */
  async getHealthStatus(): Promise<
    ApiResponse<{ status: string; version: string }>
  > {
    return this.makeRequest('/api/health');
  }

  /**
   * Get API configuration
   */
  getConfig() {
    return {
      baseUrl: this.baseUrl,
      timeout: this.timeout,
      retryAttempts: this.retryAttempts,
      retryDelay: this.retryDelay,
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Create singleton instance
export const unifiedBookingApi = new UnifiedBookingApiClient();

// Export types - only export types that are not defined elsewhere
export type {
  BookingCreateRequest,
  BookingCreateResponse,
  AvailabilityRequest,
  AvailabilityResponse,
};

// Export client class for testing
export { UnifiedBookingApiClient };
