// API Contract Types for Speedy Van Admin Dashboard
// These types match the API contracts defined in API_CONTRACTS.md

// ============================================================================
// Common Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor?: string;
  total?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  user?: User;
}

// ============================================================================
// Orders Management
// ============================================================================

export type OrderStatus =
  | 'pending'
  | 'CONFIRMED'
  | 'in_progress'
  | 'COMPLETED'
  | 'CANCELLED';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order {
  id: string;
  reference: string;
  status: OrderStatus;
  pickupAddress: string;
  dropoffAddress: string;
  scheduledAt: string;
  timeSlot: string;
  totalGBP: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
  customer: Customer;
  driver?: Driver;
  Assignment?: Assignment;
}

export interface Assignment {
  id: string;
  status: string;
  driver: Driver;
  events?: AssignmentEvent[];
}

export interface AssignmentEvent {
  id: string;
  type: string;
  description: string;
  createdAt: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  q?: string;
  from?: string;
  to?: string;
  payment?: PaymentStatus;
  driver?: string;
  area?: string;
  dateRange?: 'today' | 'week' | 'month';
  take?: number;
  cursor?: string;
}

export interface OrderUpdateRequest {
  status?: OrderStatus;
  driverId?: string | null;
  timeSlot?: string;
  preferredDate?: string;
  notes?: string;
  reason?: string;
}

export interface DriverAssignmentRequest {
  driverId?: string;
  autoAssign?: boolean;
  reason?: string;
}

export interface DriverSuggestion {
  id: string;
  score: number;
  activeJobs: number;
  suitability: 'available' | 'at_capacity';
  user: User;
  rating: number;
  vehicles: Vehicle[];
}

export interface AssignmentSuggestionsResponse {
  Booking: {
    id: string;
    pickupLat: number;
    pickupLng: number;
    dropoffLat: number;
    dropoffLng: number;
    scheduledAt: string;
    timeSlot: string;
    vanSize: string;
    crewSize: number;
  };
  suggestions: DriverSuggestion[];
}

// ============================================================================
// Refunds Management
// ============================================================================

export type RefundReason =
  | 'customer_request'
  | 'service_issue'
  | 'duplicate_charge'
  | 'fraud'
  | 'other';
export type RefundStatus = 'pending' | 'processing' | 'COMPLETED' | 'failed';

export interface Refund {
  id: string;
  paymentId: string;
  amount: number;
  reason: RefundReason;
  status: RefundStatus;
  notes?: string;
  createdAt: string;
  payment: {
    id: string;
    amount: number;
    Booking: {
      reference: string;
      customer: {
        user: {
          name: string;
          email: string;
        };
      };
    };
  };
}

export interface CreateRefundRequest {
  paymentId: string;
  amount: number;
  reason: RefundReason;
  notes?: string;
}

export interface RefundFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: RefundStatus;
  reason?: RefundReason;
  fromDate?: string;
  toDate?: string;
}

export interface RefundsListResponse {
  refunds: Refund[];
  total: number;
  summary: {
    totalAmount: number;
    totalCount: number;
  };
  reasonsBreakdown: Array<{
    reason: string;
    totalAmount: number;
    count: number;
  }>;
}

// ============================================================================
// Drivers Management
// ============================================================================

export type DriverStatus = 'active' | 'suspended' | 'inactive';
export type OnboardingStatus = 'pending' | 'approved' | 'rejected';
export type AvailabilityStatus = 'online' | 'offline' | 'break';

export interface Driver {
  id: string;
  status: DriverStatus;
  onboardingStatus: OnboardingStatus;
  rating: number;
  strikes: number;
  createdAt: string;
  user: User;
  profile?: DriverProfile;
  vehicles: Vehicle[];
  checks?: DriverChecks;
  documents: DriverDocument[];
  ratings: DriverRating[];
  incidents?: DriverIncident[];
  bookings?: DriverBooking[];
  availability?: DriverAvailability;
}

export interface DriverProfile {
  phone?: string;
  experience?: string;
  basePostcode?: string;
  rightToWorkType?: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  reg: string;
  weightClass: string;
  motExpiry?: string;
}

export interface DriverChecks {
  rtwMethod?: string;
  rtwExpiresAt?: string;
  licenceCategories?: string[];
  points?: number;
  licenceExpiry?: string;
  dbsType?: string;
  dbsCheckedAt?: string;
  insurancePolicyNo?: string;
  insurer?: string;
  policyEnd?: string;
}

export interface DriverDocument {
  id: string;
  category: string;
  fileUrl: string;
  status: string;
  uploadedAt: string;
  expiresAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface DriverRating {
  rating: number;
  createdAt: string;
}

export interface DriverIncident {
  id: string;
  type: string;
  severity: string;
  description: string;
  createdAt: string;
  resolved: boolean;
}

export interface DriverBooking {
  id: string;
  status: string;
  totalGBP: number;
  createdAt: string;
}

export interface DriverAvailability {
  status: AvailabilityStatus;
  lastSeen: string;
}

export interface DriverFilters {
  status?: OnboardingStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface DriversListResponse {
  drivers: Driver[];
  total: number;
  summary: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

export interface ApproveDriverRequest {
  notes?: string;
  conditions?: string[];
}

export interface RejectDriverRequest {
  reason: string;
  notes?: string;
}

export interface UpdateDriverRequest {
  status?: DriverStatus;
  notes?: string;
  reason?: string;
}

// ============================================================================
// Configuration Management
// ============================================================================

// ============================================================================
// Analytics
// ============================================================================

export type AnalyticsRange = '24h' | '7d' | '30d';

export interface AnalyticsSummary {
  revenue: {
    total30d: number;
    total7d: number;
    total24h: number;
    average: number;
    trend: number;
  };
  Booking: {
    total: number;
    byStatus: {
      pending: number;
      assigned: number;
      in_progress: number;
      completed: number;
      cancelled: number;
    };
    trend: number;
  };
  drivers: {
    total: number;
    active: number;
    online: number;
    averageRating: number;
    onTimeRate: number;
  };
  performance: {
    averageResponseTime: number;
    onTimePickupRate: number;
    onTimeDeliveryRate: number;
    cancellationRate: number;
  };
  realtime: {
    jobsInProgress: number;
    latePickups: number;
    lateDeliveries: number;
    pendingAssignments: number;
  };
  serviceAreas: Array<{
    regionKey: string;
    Booking: number;
    revenue: number;
    averageRating: number;
  }>;
  cancellationReasons: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;
  recentBookings: Array<{
    date: string;
    Booking: number;
    revenue: number;
  }>;
}

// ============================================================================
// Error Responses
// ============================================================================

export interface ApiError {
  error: string;
  details?: Record<string, string>;
  code?: string;
}

// ============================================================================
// Webhook Types
// ============================================================================

export interface OrderStatusWebhook {
  event: 'order.status_changed';
  data: {
    orderId: string;
    reference: string;
    oldStatus: string;
    newStatus: string;
    timestamp: string;
  };
}

export interface DriverAssignmentWebhook {
  event: 'driver.assigned';
  data: {
    orderId: string;
    driverId: string;
    timestamp: string;
  };
}

export interface PaymentWebhook {
  event: 'payment.refunded';
  data: {
    paymentId: string;
    refundId: string;
    amount: number;
    timestamp: string;
  };
}

export type WebhookEvent =
  | OrderStatusWebhook
  | DriverAssignmentWebhook
  | PaymentWebhook;

// ============================================================================
// Rate Limiting
// ============================================================================

export interface RateLimitHeaders {
  'X-RateLimit-Limit': string;
  'X-RateLimit-Remaining': string;
  'X-RateLimit-Reset': string;
}

// ============================================================================
// Audit Logging
// ============================================================================

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  diffJson?: Record<string, any>;
  ip: string;
  ua: string;
  createdAt: string;
  notes?: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface OrdersListResponse extends PaginatedResponse<Order> {}
export interface DriversListResponse extends PaginatedResponse<Driver> {}
export interface RefundsListResponse extends PaginatedResponse<Refund> {}

// ============================================================================
// Request/Response Type Guards
// ============================================================================

export function isOrderStatus(status: string): status is OrderStatus {
  return [
    'pending',
    'CONFIRMED',
    'in_progress',
    'COMPLETED',
    'CANCELLED',
  ].includes(status);
}

export function isPaymentStatus(status: string): status is PaymentStatus {
  return ['pending', 'paid', 'failed', 'refunded'].includes(status);
}

export function isRefundReason(reason: string): reason is RefundReason {
  return [
    'customer_request',
    'service_issue',
    'duplicate_charge',
    'fraud',
    'other',
  ].includes(reason);
}

export function isDriverStatus(status: string): status is DriverStatus {
  return ['active', 'suspended', 'inactive'].includes(status);
}

export function isOnboardingStatus(status: string): status is OnboardingStatus {
  return ['pending', 'approved', 'rejected'].includes(status);
}

export function isAnalyticsRange(range: string): range is AnalyticsRange {
  return ['24h', '7d', '30d'].includes(range);
}
