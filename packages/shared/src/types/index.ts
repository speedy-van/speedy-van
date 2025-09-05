// Core domain types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  DRIVER = 'DRIVER',
  ADMIN = 'ADMIN',
}

export interface Booking {
  id: string;
  customerId: string;
  driverId?: string;
  status: BookingStatus;
  pickupAddress: Address;
  deliveryAddress: Address;
  items: BookingItem[];
  scheduledAt: Date;
  estimatedDuration: number;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface BookingItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  weight?: number;
  dimensions?: Dimensions;
  category: ItemCategory;
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in';
}

export enum ItemCategory {
  FURNITURE = 'FURNITURE',
  APPLIANCES = 'APPLIANCES',
  BOXES = 'BOXES',
  FRAGILE = 'FRAGILE',
  OTHER = 'OTHER',
}

export interface Driver {
  id: string;
  userId: string;
  licenseNumber: string;
  vehicleType: VehicleType;
  isAvailable: boolean;
  currentLocation?: Location;
  rating: number;
  totalDeliveries: number;
}

export enum VehicleType {
  VAN = 'VAN',
  TRUCK = 'TRUCK',
  PICKUP = 'PICKUP',
}

export interface Location {
  latitude: number;
  longitude: number;
  timestamp: Date;
}

export interface PricingQuote {
  basePrice: number;
  distancePrice: number;
  itemsPrice: number;
  timePrice: number;
  totalPrice: number;
  estimatedDuration: number;
  currency: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Authentication types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  role?: UserRole;
}

