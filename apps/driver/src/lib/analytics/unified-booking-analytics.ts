/**
 * Unified Booking System Analytics
 *
 * This module provides comprehensive analytics tracking for the unified booking system,
 * including user behavior, conversion rates, performance metrics, and A/B testing.
 */

import { unifiedBookingApi } from '../api/unified-booking-api';
import type { UnifiedBookingData } from '../unified-booking-context';

// ============================================================================
// ANALYTICS CONFIGURATION
// ============================================================================

const ANALYTICS_CONFIG = {
  // Google Analytics 4 configuration
  ga4: {
    measurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || 'G-XXXXXXXXXX',
    debugMode: process.env.NODE_ENV === 'development',
  },

  // Custom analytics endpoints
  endpoints: {
    events: '/api/analytics/events',
    conversions: '/api/analytics/conversions',
    performance: '/api/analytics/performance',
    userBehavior: '/api/analytics/user-behavior',
  },

  // Session tracking
  session: {
    timeout: 30 * 60 * 1000, // 30 minutes
    maxDuration: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Performance thresholds
  performance: {
    stepTimeout: 5 * 60 * 1000, // 5 minutes per step
    totalTimeout: 30 * 60 * 1000, // 30 minutes total
    abandonmentThreshold: 2 * 60 * 1000, // 2 minutes before marking as abandoned
  },

  // A/B testing
  abTesting: {
    enabled: true,
    variants: ['control', 'variant_a', 'variant_b'],
    defaultVariant: 'control',
  },
} as const;

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface AnalyticsEvent {
  eventName: string;
  parameters: Record<string, any>;
  timestamp: string;
  sessionId: string;
  userId?: string;
  page: string;
  userAgent: string;
  referrer?: string;
  utmData?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
}

export interface ConversionEvent extends AnalyticsEvent {
  eventName:
    | 'booking_completed'
    | 'booking_abandoned'
    | 'step_completed'
    | 'pricing_viewed';
  parameters: {
    bookingId?: string;
    step?: number;
    totalSteps: number;
    timeSpent: number;
    value?: number;
    currency?: string;
    items?: any[];
    serviceType?: string;
    distance?: number;
    [key: string]: any;
  };
}

export interface PerformanceEvent extends AnalyticsEvent {
  eventName:
    | 'step_performance'
    | 'api_performance'
    | 'page_load'
    | 'interaction';
  parameters: {
    metric: string;
    value: number;
    unit: string;
    threshold?: number;
    exceeded?: boolean;
    [key: string]: any;
  };
}

export interface UserBehaviorEvent extends AnalyticsEvent {
  eventName:
    | 'scroll_depth'
    | 'click_tracking'
    | 'form_interaction'
    | 'navigation';
  parameters: {
    element?: string;
    action?: string;
    value?: any;
    position?: { x: number; y: number };
    [key: string]: any;
  };
}

export interface SessionData {
  sessionId: string;
  startTime: string;
  lastActivity: string;
  pageViews: string[];
  events: AnalyticsEvent[];
  userData?: Partial<UnifiedBookingData>;
  deviceInfo: {
    userAgent: string;
    screenSize: { width: number; height: number };
    viewport: { width: number; height: number };
    language: string;
    timezone: string;
  };
  performance: {
    pageLoadTimes: Record<string, number>;
    stepCompletionTimes: Record<number, number>;
    apiResponseTimes: Record<string, number>;
  };
}

export interface AnalyticsMetrics {
  // Conversion metrics
  conversionRate: number;
  abandonmentRate: number;
  stepCompletionRates: Record<number, number>;

  // Performance metrics
  averageStepTime: number;
  averageTotalTime: number;
  apiResponseTime: number;

  // User behavior metrics
  averagePageViews: number;
  averageSessionDuration: number;
  bounceRate: number;

  // Business metrics
  totalBookings: number;
  totalRevenue: number;
  averageOrderValue: number;
}

// ============================================================================
// SESSION MANAGER
// ============================================================================

class SessionManager {
  private sessionId: string;
  private startTime: Date;
  private lastActivity: Date;
  private pageViews: string[] = [];
  private events: AnalyticsEvent[] = [];
  private userData?: Partial<UnifiedBookingData>;
  private deviceInfo: SessionData['deviceInfo'];
  private performance: SessionData['performance'];

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = new Date();
    this.lastActivity = new Date();
    this.deviceInfo = this.captureDeviceInfo();
    this.performance = {
      pageLoadTimes: {},
      stepCompletionTimes: {},
      apiResponseTimes: {},
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private captureDeviceInfo(): SessionData['deviceInfo'] {
    if (typeof window === 'undefined') {
      return {
        userAgent: 'server',
        screenSize: { width: 0, height: 0 },
        viewport: { width: 0, height: 0 },
        language: 'en',
        timezone: 'UTC',
      };
    }

    return {
      userAgent: navigator.userAgent,
      screenSize: {
        width: screen.width,
        height: screen.height,
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      language: navigator.language || 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    };
  }

  updateActivity(): void {
    this.lastActivity = new Date();
  }

  addPageView(page: string): void {
    this.pageViews.push(page);
    this.updateActivity();
  }

  addEvent(event: Omit<AnalyticsEvent, 'sessionId' | 'timestamp'>): void {
    const fullEvent: AnalyticsEvent = {
      ...event,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
    };

    this.events.push(fullEvent);
    this.updateActivity();
  }

  updateUserData(data: Partial<UnifiedBookingData>): void {
    this.userData = { ...this.userData, ...data };
  }

  recordPageLoadTime(page: string, loadTime: number): void {
    this.performance.pageLoadTimes[page] = loadTime;
  }

  recordStepCompletionTime(step: number, completionTime: number): void {
    this.performance.stepCompletionTimes[step] = completionTime;
  }

  recordApiResponseTime(endpoint: string, responseTime: number): void {
    this.performance.apiResponseTimes[endpoint] = responseTime;
  }

  isSessionActive(): boolean {
    const now = new Date();
    const timeSinceLastActivity = now.getTime() - this.lastActivity.getTime();
    return timeSinceLastActivity < ANALYTICS_CONFIG.session.timeout;
  }

  isSessionExpired(): boolean {
    const now = new Date();
    const sessionDuration = now.getTime() - this.startTime.getTime();
    return sessionDuration > ANALYTICS_CONFIG.session.maxDuration;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getSessionData(): SessionData {
    return {
      sessionId: this.sessionId,
      startTime: this.startTime.toISOString(),
      lastActivity: this.lastActivity.toISOString(),
      pageViews: this.pageViews,
      events: this.events,
      userData: this.userData,
      deviceInfo: this.deviceInfo,
      performance: this.performance,
    };
  }

  getSessionDuration(): number {
    return new Date().getTime() - this.startTime.getTime();
  }

  getTimeSinceLastActivity(): number {
    return new Date().getTime() - this.lastActivity.getTime();
  }
}

// ============================================================================
// GOOGLE ANALYTICS 4 INTEGRATION
// ============================================================================

class GoogleAnalytics4 {
  private measurementId: string;
  private debugMode: boolean;
  private isInitialized = false;

  constructor(config = ANALYTICS_CONFIG.ga4) {
    this.measurementId = config.measurementId;
    this.debugMode = config.debugMode;
  }

  initialize(): void {
    if (typeof window === 'undefined' || this.isInitialized) return;

    // Load Google Analytics 4 script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', this.measurementId, {
      debug_mode: this.debugMode,
      send_page_view: false, // We'll handle this manually
    });

    this.isInitialized = true;
  }

  trackEvent(eventName: string, parameters: Record<string, any> = {}): void {
    if (typeof window === 'undefined' || !this.isInitialized) return;

    try {
      window.gtag('event', eventName, parameters);
    } catch (error) {
      console.error('Error tracking GA4 event:', error);
    }
  }

  trackPageView(page: string, title?: string): void {
    if (typeof window === 'undefined' || !this.isInitialized) return;

    try {
      window.gtag('event', 'page_view', {
        page_title: title || page,
        page_location: page,
      });
    } catch (error) {
      console.error('Error tracking GA4 page view:', error);
    }
  }

  setUserProperties(properties: Record<string, any>): void {
    if (typeof window === 'undefined' || !this.isInitialized) return;

    try {
      Object.entries(properties).forEach(([key, value]) => {
        window.gtag('config', this.measurementId, {
          [key]: value,
        });
      });
    } catch (error) {
      console.error('Error setting GA4 user properties:', error);
    }
  }
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private thresholds: Map<string, number> = new Map();

  constructor() {
    this.setupPerformanceObservers();
  }

  private setupPerformanceObservers(): void {
    if (typeof window === 'undefined') return;

    // Monitor page load performance
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver(list => {
          list.getEntries().forEach(entry => {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              this.recordMetric(
                'page_load_time',
                navEntry.loadEventEnd - navEntry.loadEventStart
              );
              this.recordMetric(
                'dom_content_loaded',
                navEntry.domContentLoadedEventEnd -
                  navEntry.domContentLoadedEventStart
              );
              this.recordMetric(
                'first_paint',
                navEntry.responseStart - navEntry.requestStart
              );
            }
          });
        });
        observer.observe({ entryTypes: ['navigation'] });
      } catch (error) {
        console.warn('PerformanceObserver not supported:', error);
      }
    }
  }

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);

    // Check if threshold is exceeded
    const threshold = this.thresholds.get(name);
    if (threshold && value > threshold) {
      this.onThresholdExceeded(name, value, threshold);
    }
  }

  setThreshold(name: string, threshold: number): void {
    this.thresholds.set(name, threshold);
  }

  getMetric(name: string): {
    average: number;
    min: number;
    max: number;
    count: number;
  } {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) {
      return { average: 0, min: 0, max: 0, count: 0 };
    }

    const sum = values.reduce((a, b) => a + b, 0);
    return {
      average: sum / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    };
  }

  private onThresholdExceeded(
    metric: string,
    value: number,
    threshold: number
  ): void {
    // Emit performance event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'performance_threshold_exceeded', {
        metric_name: metric,
        value: value,
        threshold: threshold,
        exceeded_by: value - threshold,
      });
    }
  }
}

// ============================================================================
// A/B TESTING MANAGER
// ============================================================================

class ABTestingManager {
  private variant: typeof ANALYTICS_CONFIG.abTesting.variants[number];
  private experiments: Map<string, typeof ANALYTICS_CONFIG.abTesting.variants[number]> = new Map();

  constructor() {
    this.variant = this.determineVariant();
    this.initializeExperiments();
  }

  private determineVariant(): typeof ANALYTICS_CONFIG.abTesting.variants[number] {
    if (typeof window === 'undefined')
      return ANALYTICS_CONFIG.abTesting.defaultVariant;

    // Check for existing variant in localStorage
    const stored = localStorage.getItem('ab_testing_variant');
    if (stored && ANALYTICS_CONFIG.abTesting.variants.includes(stored as any)) {
      return stored as any;
    }

    // Randomly assign variant
    const randomVariant =
      ANALYTICS_CONFIG.abTesting.variants[
        Math.floor(Math.random() * ANALYTICS_CONFIG.abTesting.variants.length)
      ];

    localStorage.setItem('ab_testing_variant', randomVariant);
    return randomVariant;
  }

  private initializeExperiments(): void {
    // Define experiments
    this.experiments.set('booking_flow', this.variant);
    this.experiments.set('pricing_display', this.variant);
    this.experiments.set('step_layout', this.variant);
  }

  getVariant(): typeof ANALYTICS_CONFIG.abTesting.variants[number] {
    return this.variant;
  }

  getExperimentVariant(experimentName: string): typeof ANALYTICS_CONFIG.abTesting.variants[number] {
    return (
      this.experiments.get(experimentName) ||
      ANALYTICS_CONFIG.abTesting.defaultVariant
    );
  }

  isVariant(experimentName: string, variant: typeof ANALYTICS_CONFIG.abTesting.variants[number]): boolean {
    return this.getExperimentVariant(experimentName) === variant;
  }

  trackExperimentView(experimentName: string): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'experiment_view', {
        experiment_name: experimentName,
        variant: this.getExperimentVariant(experimentName),
      });
    }
  }

  trackExperimentConversion(
    experimentName: string,
    conversionType: string
  ): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'experiment_conversion', {
        experiment_name: experimentName,
        variant: this.getExperimentVariant(experimentName),
        conversion_type: conversionType,
      });
    }
  }
}

// ============================================================================
// MAIN ANALYTICS MANAGER
// ============================================================================

class UnifiedBookingAnalytics {
  private sessionManager: SessionManager;
  private ga4: GoogleAnalytics4;
  private performanceMonitor: PerformanceMonitor;
  private abTesting: ABTestingManager;
  private isInitialized = false;

  constructor() {
    this.sessionManager = new SessionManager();
    this.ga4 = new GoogleAnalytics4();
    this.performanceMonitor = new PerformanceMonitor();
    this.abTesting = new ABTestingManager();
  }

  /**
   * Initialize analytics system
   */
  initialize(): void {
    if (this.isInitialized) return;

    this.ga4.initialize();
    this.isInitialized = true;

    // Track session start
    this.trackEvent('session_start', {
      session_id: this.sessionManager.getSessionId(),
      variant: this.abTesting.getVariant(),
    });
  }

  /**
   * Track page view
   */
  trackPageView(page: string, title?: string): void {
    this.sessionManager.addPageView(page);
    this.ga4.trackPageView(page, title);

    this.trackEvent('page_view', {
      page,
      title,
      session_id: this.sessionManager.getSessionId(),
    });
  }

  /**
   * Track custom event
   */
  trackEvent(eventName: string, parameters: Record<string, any> = {}): void {
    const event: Omit<AnalyticsEvent, 'sessionId' | 'timestamp'> = {
      eventName,
      parameters: {
        ...parameters,
        session_id: this.sessionManager.getSessionId(),
        variant: this.abTesting.getVariant(),
      },
      page: window?.location?.pathname || 'unknown',
      userAgent: navigator?.userAgent || 'unknown',
      referrer: document?.referrer,
    };

    this.sessionManager.addEvent(event);
    this.ga4.trackEvent(eventName, parameters);
  }

  /**
   * Track step completion
   */
  trackStepCompletion(step: number, stepData: any, timeSpent: number): void {
    this.sessionManager.recordStepCompletionTime(step, timeSpent);

    this.trackEvent('step_completed', {
      step,
      step_data: stepData,
      time_spent: timeSpent,
      session_id: this.sessionManager.getSessionId(),
    });

    // Track in GA4
    this.ga4.trackEvent('step_completed', {
      step_number: step,
      time_spent: timeSpent,
      step_data: JSON.stringify(stepData),
    });
  }

  /**
   * Track booking abandonment
   */
  trackAbandonment(
    step: number,
    reason: string,
    partialData?: Partial<UnifiedBookingData>
  ): void {
    this.trackEvent('booking_abandoned', {
      step,
      reason,
      partial_data: partialData,
      session_duration: this.sessionManager.getSessionDuration(),
      session_id: this.sessionManager.getSessionId(),
    });

    // Track in GA4
    this.ga4.trackEvent('booking_abandoned', {
      step_number: step,
      abandonment_reason: reason,
      session_duration: this.sessionManager.getSessionDuration(),
    });
  }

  /**
   * Track booking completion
   */
  trackBookingCompletion(
    bookingId: string,
    totalTime: number,
    stepsCompleted: number[]
  ): void {
    this.trackEvent('booking_completed', {
      booking_id: bookingId,
      total_time: totalTime,
      steps_completed: stepsCompleted,
      session_duration: this.sessionManager.getSessionDuration(),
      session_id: this.sessionManager.getSessionId(),
    });

    // Track in GA4
    this.ga4.trackEvent('booking_completed', {
      booking_id: bookingId,
      total_time: totalTime,
      steps_completed: stepsCompleted.length,
      session_duration: this.sessionManager.getSessionDuration(),
    });
  }

  /**
   * Track API performance
   */
  trackApiPerformance(
    endpoint: string,
    responseTime: number,
    success: boolean
  ): void {
    this.sessionManager.recordApiResponseTime(endpoint, responseTime);
    this.performanceMonitor.recordMetric('api_response_time', responseTime);

    this.trackEvent('api_performance', {
      endpoint,
      response_time: responseTime,
      success,
      session_id: this.sessionManager.getSessionId(),
    });
  }

  /**
   * Track user behavior
   */
  trackUserBehavior(action: string, element?: string, value?: any): void {
    this.trackEvent('user_behavior', {
      action,
      element,
      value,
      session_id: this.sessionManager.getSessionId(),
    });
  }

  /**
   * Track experiment view
   */
  trackExperimentView(experimentName: string): void {
    this.abTesting.trackExperimentView(experimentName);
  }

  /**
   * Track experiment conversion
   */
  trackExperimentConversion(
    experimentName: string,
    conversionType: string
  ): void {
    this.abTesting.trackExperimentConversion(experimentName, conversionType);
  }

  /**
   * Get current session data
   */
  getSessionData(): SessionData {
    return this.sessionManager.getSessionData();
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): Record<
    string,
    { average: number; min: number; max: number; count: number }
  > {
    const metrics: Record<
      string,
      { average: number; min: number; max: number; count: number }
    > = {};

    // Get all recorded metrics
    ['page_load_time', 'api_response_time', 'step_completion_time'].forEach(
      metric => {
        metrics[metric] = this.performanceMonitor.getMetric(metric);
      }
    );

    return metrics;
  }

  /**
   * Get A/B testing variant
   */
  getVariant(): typeof ANALYTICS_CONFIG.abTesting.variants[number] {
    return this.abTesting.getVariant();
  }

  /**
   * Check if current variant matches
   */
  isVariant(experimentName: string, variant: typeof ANALYTICS_CONFIG.abTesting.variants[number]): boolean {
    return this.abTesting.isVariant(experimentName, variant);
  }

  /**
   * Update user data
   */
  updateUserData(data: Partial<UnifiedBookingData>): void {
    this.sessionManager.updateUserData(data);
  }

  /**
   * End current session
   */
  endSession(): void {
    const sessionData = this.sessionManager.getSessionData();

    // Track session end
    this.trackEvent('session_end', {
      session_duration: this.sessionManager.getSessionDuration(),
      total_events: sessionData.events.length,
      total_page_views: sessionData.pageViews.length,
    });

    // Send session data to analytics API
    this.sendSessionData(sessionData);
  }

  /**
   * Send session data to analytics API
   */
  private async sendSessionData(sessionData: SessionData): Promise<void> {
    try {
      await unifiedBookingApi.trackCompletion(
        'session',
        sessionData.sessionId,
        sessionData.performance.stepCompletionTimes[1] || 0,
        Object.keys(sessionData.performance.stepCompletionTimes).map(Number)
      );
    } catch (error) {
      console.error('Failed to send session data:', error);
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Create singleton instance
export const unifiedBookingAnalytics = new UnifiedBookingAnalytics();

// Types are already exported in their declarations above

// Export classes for testing
export {
  SessionManager,
  GoogleAnalytics4,
  PerformanceMonitor,
  ABTestingManager,
  UnifiedBookingAnalytics,
};
