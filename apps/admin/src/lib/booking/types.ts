import { z } from 'zod';
import { 
  coordinatesSchema, 
  addressSchema, 
  propertyDetailsSchema, 
  itemSchema, 
  timeSlotSchema, 
  serviceTypeSchema, 
  customerDetailsSchema, 
  pricingBreakdownSchema 
} from './schemas';

// Base types from schemas
export type Coordinates = z.infer<typeof coordinatesSchema>;
export type Address = z.infer<typeof addressSchema>;
export type PropertyDetails = z.infer<typeof propertyDetailsSchema>;
export type BookingItem = z.infer<typeof itemSchema>;
export type TimeSlot = z.infer<typeof timeSlotSchema>;
export type ServiceType = z.infer<typeof serviceTypeSchema>;
export type CustomerDetails = z.infer<typeof customerDetailsSchema>;
export type PricingBreakdown = z.infer<typeof pricingBreakdownSchema>;

// Step data types
export type Step1Data = z.infer<typeof import('./schemas').step1Schema>;
export type Step2Data = z.infer<typeof import('./schemas').step2Schema>;
export type Step3Data = z.infer<typeof import('./schemas').step3Schema>;
export type Step4Data = z.infer<typeof import('./schemas').step4Schema>;

// Enhanced time slot interface
export interface EnhancedTimeSlot extends TimeSlot {
  type: 'early' | 'morning' | 'afternoon' | 'evening' | 'late';
  multiplier: number;
  demand: 'low' | 'medium' | 'high' | 'veryHigh';
  weatherImpact?: {
    condition: 'clear' | 'cloudy' | 'lightRain' | 'heavyRain' | 'snow' | 'storm';
    message: string;
    available: boolean;
  };
}

// Property details interface for pricing engine
export interface PricingPropertyDetails {
  type: 'house' | 'flat' | 'office' | 'storage' | 'other';
  floor: number;
  hasLift: boolean;
  narrowAccess: boolean;
  longCarry?: boolean;
}

// Pricing input interface
export interface PricingInput {
  items: BookingItem[];
  serviceType: string;
  distance: number;
  estimatedDuration: number;
  timeSlot: EnhancedTimeSlot;
  date: Date;
  pickupProperty: PricingPropertyDetails;
  dropoffProperty: PricingPropertyDetails;
  promoCode?: string;
  isFirstTimeCustomer?: boolean;
  coordinates?: {
    pickup: Coordinates;
    dropoff: Coordinates;
  };
}

// Detailed pricing breakdown interface
export interface DetailedPricingBreakdown extends PricingBreakdown {
  breakdown: {
    baseFee: number;
    serviceCharge: number;
    volumeCharge: number;
    distanceCharge: number;
    timeCharge: number;
    timeSlotMultiplier: number;
    seasonalMultiplier: number;
    demandMultiplier: number;
    specialItemSurcharges: Array<{ name: string; amount: number }>;
    accessSurcharges: Array<{ name: string; amount: number }>;
    promoDiscount: number;
    subtotalBeforeVAT: number;
    vatAmount: number;
    finalTotal: number;
  };
  recommendations?: {
    suggestedService?: string;
    potentialSavings?: Array<{ description: string; amount: number }>;
    upgradeOptions?: Array<{
      service: string;
      additionalCost: number;
      benefits: string[];
    }>;
  };
}

// Promo code interface
export interface PromoCode {
  code: string;
  type: 'percentage' | 'fixed' | 'free_service';
  value: number;
  description: string;
  minOrderValue?: number;
  maxDiscount?: number;
  validUntil?: Date;
  usageLimit?: number;
  usedCount: number;
  conditions?: {
    firstTimeCustomer?: boolean;
    serviceTypes?: string[];
    minimumDistance?: number;
    minimumVolume?: number;
  };
}

// Service type definitions
export const SERVICE_TYPES: Record<string, ServiceType> = {
  'man-and-van': {
    id: 'man-and-van',
    name: 'Man & Van',
    description: 'Professional driver with helper for loading/unloading',
    basePrice: 45.0,
    pricePerKm: 1.5,
    pricePerHour: 35.0,
    includedServices: [
      'Loading/unloading',
      'Basic packing materials',
      'Furniture protection',
    ],
    maxVolume: 15,
    maxWeight: 1000,
    crewSize: 2,
    vehicleType: 'Transit Van',
  },
  'van-only': {
    id: 'van-only',
    name: 'Van Only',
    description: 'Self-drive van rental for DIY moves',
    basePrice: 35.0,
    pricePerKm: 1.2,
    includedServices: ['Van rental', 'Basic insurance', 'Fuel included'],
    maxVolume: 12,
    maxWeight: 800,
    crewSize: 0,
    vehicleType: 'Transit Van',
  },
  'large-van': {
    id: 'large-van',
    name: 'Large Van Service',
    description: 'Larger vehicle for bigger moves with 2-person crew',
    basePrice: 65.0,
    pricePerKm: 2.0,
    pricePerHour: 45.0,
    includedServices: [
      '2-person crew',
      'Loading/unloading',
      'Furniture protection',
      'Blankets & straps',
    ],
    maxVolume: 25,
    maxWeight: 1500,
    crewSize: 2,
    vehicleType: 'Luton Van',
  },
  'multiple-trips': {
    id: 'multiple-trips',
    name: 'Multiple Trips',
    description: 'Multiple van trips for large moves',
    basePrice: 55.0,
    pricePerKm: 1.75,
    pricePerHour: 40.0,
    includedServices: [
      'Multiple trips',
      '2-person crew',
      'Coordination',
      'Flexible scheduling',
    ],
    maxVolume: 50,
    maxWeight: 3000,
    crewSize: 2,
    vehicleType: 'Multiple Vans',
  },
  premium: {
    id: 'premium',
    name: 'Premium Service',
    description: 'White-glove service with full packing and insurance',
    basePrice: 85.0,
    pricePerKm: 2.5,
    pricePerHour: 60.0,
    includedServices: [
      'Full packing service',
      'Premium insurance',
      'Disassembly/assembly',
      'White-glove handling',
    ],
    maxVolume: 30,
    maxWeight: 2000,
    crewSize: 3,
    vehicleType: 'Premium Van',
  },
};

// Pricing configuration
export const PRICING_CONFIG = {
  // Base rates
  baseFee: 25.0, // Minimum booking fee
  vatRate: 0.2, // 20% VAT

  // Distance-based pricing
  freeDistanceKm: 5, // First 5km free
  pricePerKm: 1.5, // £1.50 per km after free distance
  longDistanceSurcharge: 0.25, // Additional 25p per km for distances > 50km
  longDistanceThreshold: 50,

  // Volume-based pricing
  pricePerCubicMeter: 8.0, // £8 per m³
  volumeDiscountThreshold: 10, // Discount for bookings > 10m³
  volumeDiscountRate: 0.1, // 10% discount for large volumes

  // Time-based pricing
  minimumDuration: 2, // Minimum 2 hours
  pricePerHour: 35.0, // £35 per hour
  overtimeMultiplier: 1.5, // 50% extra for overtime

  // Service-specific multipliers
  serviceMultipliers: {
    'man-and-van': 1.0,
    'van-only': 0.8,
    'large-van': 1.3,
    'multiple-trips': 1.2,
    premium: 1.5,
  },

  // Seasonal multipliers
  seasonalMultipliers: {
    peak: 1.2, // Summer, Christmas
    high: 1.1, // Spring, Autumn
    normal: 1.0, // Winter (except Christmas)
  },

  // Demand-based multipliers
  demandMultipliers: {
    low: 0.95,
    medium: 1.0,
    high: 1.15,
    veryHigh: 1.3,
  },

  // Special item surcharges
  specialItemSurcharges: {
    piano: 50.0,
    antique: 25.0,
    artwork: 30.0,
    fragile: 15.0,
    valuable: 20.0,
    heavy: 10.0, // Items > 50kg
  },

  // Property access surcharges
  accessSurcharges: {
    noLift: 15.0, // Per floor above ground
    narrowAccess: 20.0,
    longCarry: 25.0, // > 50m from parking
    stairs: 10.0, // Per floor
  },

  // Promotional discount limits
  maxDiscountPercentage: 30,
  maxDiscountAmount: 100.0,
} as const;
