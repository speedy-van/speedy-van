// src/lib/pricing/engine.ts
// -----------------------------------------------------------------------------
// UNIFIED PRICING ENGINE for Speedy Van (UK market)
// Merges legacy system with advanced features:
// - Service-based pricing (man-and-van, van-only, premium, etc.)
// - Seasonal and demand multipliers
// - Special item surcharges
// - Property access surcharges
// - Promotional codes
// - Enhanced volume calculations
// Currency: GBP (£). Distance unit: miles.
// -----------------------------------------------------------------------------

import { NormalizedItem, QuoteBreakdown } from './types';

// =============================================================================
// ENHANCED INTERFACES (Backward Compatible + New Features)
// =============================================================================

// Legacy interface for backward compatibility
export interface PricingInputs {
  distanceMiles: number;
  items: NormalizedItem[];
  pickupFloors: number;
  pickupHasLift: boolean;
  dropoffFloors: number;
  dropoffHasLift: boolean;
  helpersCount: number;
  extras: {
    ulez: boolean;
    vat: boolean;
  };
}

// Enhanced interface with new features
export interface PricingRequest extends PricingInputs {
  // New optional fields
  serviceType?: string;
  date?: Date;
  timeSlot?: string;
  pickupProperty?: {
    narrowAccess?: boolean;
    longCarry?: boolean;
  };
  dropoffProperty?: {
    narrowAccess?: boolean;
    longCarry?: boolean;
  };
  promoCode?: string;
  isFirstTimeCustomer?: boolean;
}

export interface PricingResponse {
  success: boolean;
  breakdown: QuoteBreakdown;
  requiresHelpers: boolean;
  suggestions: string[];
  errors?: string[];
  // New enhanced fields
  enhancedBreakdown?: EnhancedBreakdown;
  recommendations?: PricingRecommendations;
}

// New enhanced breakdown interface
export interface EnhancedBreakdown {
  baseFee: number;
  serviceCharge: number;
  volumeCharge: number;
  distanceCharge: number;
  timeCharge: number;
  timeSlotMultiplier: number;
  seasonalMultiplier: number;
  demandMultiplier: number;
  serviceMultiplier: number;
  specialItemSurcharges: Array<{ name: string; amount: number }>;
  accessSurcharges: Array<{ name: string; amount: number }>;
  promoDiscount: number;
  subtotalBeforeVAT: number;
  vatAmount: number;
  finalTotal: number;
}

export interface PricingRecommendations {
  suggestedService?: string;
  potentialSavings?: Array<{ description: string; amount: number }>;
  upgradeOptions?: Array<{
    service: string;
    additionalCost: number;
    benefits: string[];
  }>;
}

// =============================================================================
// SERVICE TYPE DEFINITIONS
// =============================================================================

export interface ServiceType {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  pricePerMile: number;
  pricePerHour?: number;
  includedServices: string[];
  maxVolume: number;
  maxWeight: number;
  crewSize: number;
  vehicleType: string;
}

export const SERVICE_TYPES: Record<string, ServiceType> = {
  'man-and-van': {
    id: 'man-and-van',
    name: 'Man & Van',
    description: 'Professional driver with helper for loading/unloading',
    basePrice: 45.0,
    pricePerMile: 1.5,
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
    pricePerMile: 1.2,
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
    pricePerMile: 2.0,
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
    pricePerMile: 1.75,
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
    pricePerMile: 2.5,
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

// =============================================================================
// PRICING CONFIGURATION
// =============================================================================

export const PRICING_CONFIG = {
  // Base rates
  baseFee: 25.0, // Minimum booking fee
  vatRate: 0.2, // 20% VAT

  // Distance-based pricing
  freeDistanceMiles: 5, // First 5 miles free
  pricePerMile: 1.5, // £1.50 per mile after free distance
  longDistanceSurcharge: 0.25, // Additional 25p per mile for distances > 50 miles
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

  // Legacy constants (maintained for backward compatibility)
  SHORT_DISTANCE: 40, // 0-10 miles
  MEDIUM_DISTANCE: 60, // 10-50 miles
  LONG_DISTANCE_RATE: 1.2, // £1.20 per mile beyond 50
  LONG_DISTANCE_THRESHOLD: 50,
  FLOOR_COST: 10, // £10 per floor without lift
  LIFT_DISCOUNT: 0.6, // 60% discount with lift
  HELPER_COST: 20, // £20 per helper
  ULEZ_COST: 12.5, // £12.50 ULEZ charge
  MINIMUM_TOTAL: 55, // £55 minimum
} as const;

// =============================================================================
// PROMOTIONAL CODES
// =============================================================================

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

export const PROMO_CODES: Record<string, PromoCode> = {
  FIRST20: {
    code: 'FIRST20',
    type: 'percentage',
    value: 20,
    description: '20% off your first booking',
    maxDiscount: 50.0,
    usedCount: 0,
    conditions: { firstTimeCustomer: true },
  },
  SAVE15: {
    code: 'SAVE15',
    type: 'percentage',
    value: 15,
    description: '15% off any booking',
    minOrderValue: 100.0,
    maxDiscount: 75.0,
    usedCount: 0,
  },
  FREEPACKING: {
    code: 'FREEPACKING',
    type: 'free_service',
    value: 25.0,
    description: 'Free packing materials',
    minOrderValue: 80.0,
    usedCount: 0,
  },
  STUDENT10: {
    code: 'STUDENT10',
    type: 'percentage',
    value: 10,
    description: 'Student discount',
    maxDiscount: 30.0,
    usedCount: 0,
  },
};

// =============================================================================
// UNIFIED PRICING ENGINE
// =============================================================================

export class PricingEngine {
  private cache = new Map<string, PricingResponse>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // =============================================================================
  // MAIN PRICING METHOD (Enhanced + Backward Compatible)
  // =============================================================================

  public calculateQuote(request: PricingRequest): PricingResponse {
    // Check cache first
    const cacheKey = this.generateCacheKey(request);
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const errors: string[] = [];
    const suggestions: string[] = [];

    // Validate inputs
    if (request.distanceMiles < 0) {
      errors.push('Distance cannot be negative');
    }

    if (request.items.length === 0) {
      errors.push('At least one item is required');
    }

    if (request.pickupFloors < 0 || request.dropoffFloors < 0) {
      errors.push('Floor numbers cannot be negative');
    }

    if (request.helpersCount < 0) {
      errors.push('Helper count cannot be negative');
    }

    if (errors.length > 0) {
      return {
        success: false,
        breakdown: this.createEmptyBreakdown(),
        requiresHelpers: false,
        suggestions: [],
        errors,
      };
    }

    try {
      // =============================================================================
      // ENHANCED PRICING CALCULATION
      // =============================================================================

      // Get service type (default to man-and-van if not specified)
      const serviceType = request.serviceType || 'man-and-van';
      const serviceConfig = SERVICE_TYPES[serviceType];

      if (!serviceConfig) {
        return {
          success: false,
          breakdown: this.createEmptyBreakdown(),
          requiresHelpers: false,
          suggestions: [],
          errors: [`Invalid service type: ${serviceType}`],
        };
      }

      // Calculate base components
      const baseFee = PRICING_CONFIG.baseFee;
      const serviceCharge = serviceConfig.basePrice;

      // Volume-based pricing
      const totalVolume = this.calculateTotalVolumeFactor(request.items);
      let volumeCharge = totalVolume * PRICING_CONFIG.pricePerCubicMeter;

      // Apply volume discount for large bookings
      if (totalVolume > PRICING_CONFIG.volumeDiscountThreshold) {
        volumeCharge *= 1 - PRICING_CONFIG.volumeDiscountRate;
        suggestions.push(
          `Volume discount applied: ${(PRICING_CONFIG.volumeDiscountRate * 100).toFixed(0)}% off for large bookings`
        );
      }

      // Distance-based pricing (enhanced)
      let distanceCharge = 0;
      if (request.distanceMiles > PRICING_CONFIG.freeDistanceMiles) {
        const chargeableDistance =
          request.distanceMiles - PRICING_CONFIG.freeDistanceMiles;
        distanceCharge = chargeableDistance * PRICING_CONFIG.pricePerMile;

        // Long distance surcharge
        if (request.distanceMiles > PRICING_CONFIG.longDistanceThreshold) {
          const longDistance =
            request.distanceMiles - PRICING_CONFIG.longDistanceThreshold;
          distanceCharge += longDistance * PRICING_CONFIG.longDistanceSurcharge;
          suggestions.push('Long distance surcharge applied');
        }
      } else {
        suggestions.push('Free distance allowance applied');
      }

      // Time-based pricing (if applicable)
      let timeCharge = 0;
      if (serviceConfig.pricePerHour) {
        timeCharge =
          PRICING_CONFIG.minimumDuration * serviceConfig.pricePerHour;
      }

      // =============================================================================
      // MULTIPLIERS AND SURCHARGES
      // =============================================================================

      // Apply multipliers
      const timeSlotMultiplier = this.getTimeSlotMultiplier(request.timeSlot);
      const seasonalMultiplier = this.getSeasonalMultiplier(request.date);
      const demandMultiplier = this.getDemandMultiplier(
        request.date,
        request.timeSlot
      );
      const serviceMultiplier =
        PRICING_CONFIG.serviceMultipliers[
          serviceType as keyof typeof PRICING_CONFIG.serviceMultipliers
        ] || 1.0;

      // Calculate special item surcharges
      const specialItemSurcharges = this.calculateSpecialItemSurcharges(
        request.items
      );

      // Calculate access surcharges
      const accessSurcharges = this.calculateAccessSurchargesArray(
        request.pickupFloors,
        request.pickupHasLift,
        request.dropoffFloors,
        request.dropoffHasLift,
        request.pickupProperty,
        request.dropoffProperty
      );

      // =============================================================================
      // LEGACY COMPATIBILITY CALCULATIONS
      // =============================================================================

      // Legacy distance base calculation (for backward compatibility)
      const legacyDistanceBase = this.calculateLegacyDistanceBase(
        request.distanceMiles
      );

      // Legacy floors cost calculation
      const legacyFloorsCost = this.calculateLegacyFloorsCost(
        request.pickupFloors,
        request.pickupHasLift,
        request.dropoffFloors,
        request.dropoffHasLift
      );

      // Legacy helpers cost calculation
      const legacyHelpersCost = this.calculateLegacyHelpersCost(
        request.items,
        request.helpersCount
      );

      // Check if helpers are required but not provided
      const requiresHelpers =
        this.checkIfHelpersRequired(request.items) &&
        request.helpersCount === 0;
      if (requiresHelpers) {
        suggestions.push(
          'Consider adding helpers for items requiring two people'
        );
      }

      // Legacy extras cost calculation
      const legacyExtrasCost = this.calculateLegacyExtrasCost(request.extras);

      // =============================================================================
      // ENHANCED SUBTOTAL CALCULATION
      // =============================================================================

      // Enhanced subtotal with new features
      let enhancedSubtotal =
        (baseFee + serviceCharge + volumeCharge + distanceCharge + timeCharge) *
        serviceMultiplier *
        timeSlotMultiplier *
        seasonalMultiplier *
        demandMultiplier;

      // Add surcharges
      enhancedSubtotal += specialItemSurcharges.reduce(
        (sum, s) => sum + s.amount,
        0
      );
      enhancedSubtotal += accessSurcharges.reduce(
        (sum, s) => sum + s.amount,
        0
      );

      // Apply promotional discount
      const promoDiscount = this.calculatePromoDiscount(
        request.promoCode,
        enhancedSubtotal,
        request
      );

      // Calculate final amounts
      const subtotalBeforeVAT = Math.max(0, enhancedSubtotal - promoDiscount);
      const vatAmount = subtotalBeforeVAT * PRICING_CONFIG.vatRate;
      const finalTotal = subtotalBeforeVAT + vatAmount;

      // Ensure enhanced subtotal is never negative
      enhancedSubtotal = Math.max(0, enhancedSubtotal);

      // =============================================================================
      // LEGACY SUBTOTAL CALCULATION (for backward compatibility)
      // =============================================================================

      const legacySubtotal =
        legacyDistanceBase * totalVolume +
        legacyFloorsCost +
        legacyHelpersCost +
        legacyExtrasCost;
      const legacyVat = request.extras.vat
        ? legacySubtotal * PRICING_CONFIG.vatRate
        : 0;
      let legacyTotal = legacySubtotal + legacyVat;

      // Apply minimum total
      if (legacyTotal < PRICING_CONFIG.MINIMUM_TOTAL) {
        legacyTotal = PRICING_CONFIG.MINIMUM_TOTAL;
        suggestions.push(
          `Minimum charge of £${PRICING_CONFIG.MINIMUM_TOTAL} applied`
        );
      }

      // =============================================================================
      // RESPONSE ASSEMBLY
      // =============================================================================

      // Legacy breakdown (for backward compatibility)
      const legacyBreakdown: QuoteBreakdown = {
        distanceBase: legacyDistanceBase,
        totalVolumeFactor: totalVolume,
        floorsCost: legacyFloorsCost,
        helpersCost: legacyHelpersCost,
        extrasCost: legacyExtrasCost,
        vat: legacyVat,
        total: legacyTotal,
      };

      // Enhanced breakdown (new features)
      const enhancedBreakdown: EnhancedBreakdown = {
        baseFee,
        serviceCharge,
        volumeCharge,
        distanceCharge,
        timeCharge,
        timeSlotMultiplier,
        seasonalMultiplier,
        demandMultiplier,
        serviceMultiplier,
        specialItemSurcharges,
        accessSurcharges,
        promoDiscount,
        subtotalBeforeVAT,
        vatAmount,
        finalTotal,
      };

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        request,
        enhancedSubtotal,
        serviceType
      );

      const response: PricingResponse = {
        success: true,
        breakdown: legacyBreakdown, // Legacy compatibility
        requiresHelpers,
        suggestions,
        errors: [],
        enhancedBreakdown, // New enhanced features
        recommendations,
      };

      // Cache the result
      this.cache.set(cacheKey, response);
      this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION);

      return response;
    } catch (error) {
      return {
        success: false,
        breakdown: this.createEmptyBreakdown(),
        requiresHelpers: false,
        suggestions: [],
        errors: [`Calculation error: ${error}`],
      };
    }
  }

  // =============================================================================
  // ENHANCED CALCULATION METHODS
  // =============================================================================

  private calculateSpecialItemSurcharges(
    items: NormalizedItem[]
  ): Array<{ name: string; amount: number }> {
    const surcharges: Array<{ name: string; amount: number }> = [];

    items.forEach(item => {
      // Check for special item types
      if (item.canonicalName.toLowerCase().includes('piano')) {
        surcharges.push({
          name: 'Piano handling',
          amount: PRICING_CONFIG.specialItemSurcharges.piano,
        });
      }
      if (item.canonicalName.toLowerCase().includes('antique')) {
        surcharges.push({
          name: 'Antique handling',
          amount: PRICING_CONFIG.specialItemSurcharges.antique,
        });
      }
      if (item.canonicalName.toLowerCase().includes('artwork')) {
        surcharges.push({
          name: 'Artwork handling',
          amount: PRICING_CONFIG.specialItemSurcharges.artwork,
        });
      }
      if (item.isFragile) {
        surcharges.push({
          name: 'Fragile item handling',
          amount: PRICING_CONFIG.specialItemSurcharges.fragile,
        });
      }
      if (item.canonicalName.toLowerCase().includes('valuable')) {
        surcharges.push({
          name: 'Valuable item handling',
          amount: PRICING_CONFIG.specialItemSurcharges.valuable,
        });
      }
    });

    return surcharges;
  }

  private calculateAccessSurchargesArray(
    pickupFloors: number,
    pickupHasLift: boolean,
    dropoffFloors: number,
    dropoffHasLift: boolean,
    pickupProperty?: { narrowAccess?: boolean; longCarry?: boolean },
    dropoffProperty?: { narrowAccess?: boolean; longCarry?: boolean }
  ): Array<{ name: string; amount: number }> {
    const surcharges: Array<{ name: string; amount: number }> = [];

    // Floor access surcharges
    if (pickupFloors > 0 && !pickupHasLift) {
      surcharges.push({
        name: `Pickup floor access (${pickupFloors} floors)`,
        amount: pickupFloors * PRICING_CONFIG.accessSurcharges.noLift,
      });
    }

    if (dropoffFloors > 0 && !dropoffHasLift) {
      surcharges.push({
        name: `Dropoff floor access (${dropoffFloors} floors)`,
        amount: dropoffFloors * PRICING_CONFIG.accessSurcharges.noLift,
      });
    }

    // Narrow access surcharges
    if (pickupProperty?.narrowAccess) {
      surcharges.push({
        name: 'Pickup narrow access',
        amount: PRICING_CONFIG.accessSurcharges.narrowAccess,
      });
    }

    if (dropoffProperty?.narrowAccess) {
      surcharges.push({
        name: 'Dropoff narrow access',
        amount: PRICING_CONFIG.accessSurcharges.narrowAccess,
      });
    }

    // Long carry surcharges
    if (pickupProperty?.longCarry) {
      surcharges.push({
        name: 'Pickup long carry',
        amount: PRICING_CONFIG.accessSurcharges.longCarry,
      });
    }

    if (dropoffProperty?.longCarry) {
      surcharges.push({
        name: 'Dropoff long carry',
        amount: PRICING_CONFIG.accessSurcharges.longCarry,
      });
    }

    return surcharges;
  }

  private getTimeSlotMultiplier(timeSlot?: string): number {
    // Default multiplier based on time slot
    if (!timeSlot) return 1.0;

    // Peak hours (8-10 AM, 4-6 PM) get higher multiplier
    if (
      timeSlot.includes('08:') ||
      timeSlot.includes('09:') ||
      timeSlot.includes('16:') ||
      timeSlot.includes('17:')
    ) {
      return 1.15;
    }

    // Off-peak hours get lower multiplier
    if (
      timeSlot.includes('10:') ||
      timeSlot.includes('11:') ||
      timeSlot.includes('14:') ||
      timeSlot.includes('15:')
    ) {
      return 0.95;
    }

    return 1.0;
  }

  private getSeasonalMultiplier(date?: Date): number {
    if (!date) return 1.0;

    const month = date.getMonth() + 1; // getMonth() returns 0-11

    // Peak season: Summer (June-August) and Christmas (December)
    if (month >= 6 && month <= 8)
      return PRICING_CONFIG.seasonalMultipliers.peak;
    if (month === 12) return PRICING_CONFIG.seasonalMultipliers.peak;

    // High season: Spring (March-May) and Autumn (September-November)
    if (month >= 3 && month <= 5)
      return PRICING_CONFIG.seasonalMultipliers.high;
    if (month >= 9 && month <= 11)
      return PRICING_CONFIG.seasonalMultipliers.high;

    // Normal season: Winter (January-February, except Christmas)
    return PRICING_CONFIG.seasonalMultipliers.normal;
  }

  private getDemandMultiplier(date?: Date, timeSlot?: string): number {
    if (!date || !timeSlot) return 1.0;

    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Weekend bookings get higher demand multiplier
    if (isWeekend) return PRICING_CONFIG.demandMultipliers.high;

    // Peak time slots get higher demand multiplier
    if (this.getTimeSlotMultiplier(timeSlot) > 1.0) {
      return PRICING_CONFIG.demandMultipliers.high;
    }

    return PRICING_CONFIG.demandMultipliers.medium;
  }

  private calculatePromoDiscount(
    promoCode?: string,
    subtotal: number = 0,
    request?: PricingRequest
  ): number {
    if (!promoCode) return 0;

    const promo = PROMO_CODES[promoCode.toUpperCase()];
    if (!promo) return 0;

    // Check conditions
    if (promo.conditions?.firstTimeCustomer && !request?.isFirstTimeCustomer) {
      return 0;
    }

    if (
      promo.conditions?.minimumDistance &&
      request &&
      request.distanceMiles < promo.conditions.minimumDistance
    ) {
      return 0;
    }

    if (promo.conditions?.minimumVolume) {
      const totalVolume = this.calculateTotalVolumeFactor(request?.items || []);
      if (totalVolume < promo.conditions.minimumVolume) {
        return 0;
      }
    }

    let discount = 0;

    switch (promo.type) {
      case 'percentage':
        discount = subtotal * (promo.value / 100);
        break;
      case 'fixed':
        discount = promo.value;
        break;
      case 'free_service':
        discount = Math.min(promo.value, subtotal);
        break;
    }

    // Apply maximum discount limits
    if (promo.maxDiscount) {
      discount = Math.min(discount, promo.maxDiscount);
    }

    return Math.min(discount, subtotal);
  }

  private generateRecommendations(
    request: PricingRequest,
    subtotal: number,
    currentServiceType: string
  ): PricingRecommendations {
    const recommendations: PricingRecommendations = {
      potentialSavings: [],
      upgradeOptions: [],
    };

    // Suggest alternative services for potential savings
    Object.entries(SERVICE_TYPES).forEach(([serviceId, service]) => {
      if (serviceId === currentServiceType) return;

      const potentialSavings =
        subtotal -
        (service.basePrice + request.distanceMiles * service.pricePerMile);
      if (potentialSavings > 10) {
        recommendations.potentialSavings?.push({
          description: `Switch to ${service.name}`,
          amount: potentialSavings,
        });
      }
    });

    // Suggest upgrades
    if (currentServiceType === 'van-only') {
      recommendations.upgradeOptions?.push({
        service: 'Man & Van',
        additionalCost:
          SERVICE_TYPES['man-and-van'].basePrice -
          SERVICE_TYPES['van-only'].basePrice,
        benefits: [
          'Professional loading/unloading',
          'Furniture protection',
          'Peace of mind',
        ],
      });
    }

    return recommendations;
  }

  // =============================================================================
  // LEGACY COMPATIBILITY METHODS
  // =============================================================================

  private calculateLegacyDistanceBase(distanceMiles: number): number {
    if (distanceMiles <= 10) {
      return PRICING_CONFIG.SHORT_DISTANCE;
    } else if (distanceMiles <= 50) {
      return PRICING_CONFIG.MEDIUM_DISTANCE;
    } else {
      const baseCost = PRICING_CONFIG.MEDIUM_DISTANCE;
      const additionalMiles =
        distanceMiles - PRICING_CONFIG.LONG_DISTANCE_THRESHOLD;
      const additionalCost =
        additionalMiles * PRICING_CONFIG.LONG_DISTANCE_RATE;
      return baseCost + additionalCost;
    }
  }

  private calculateLegacyFloorsCost(
    pickupFloors: number,
    pickupHasLift: boolean,
    dropoffFloors: number,
    dropoffHasLift: boolean
  ): number {
    let totalCost = 0;

    // Pickup floors cost
    if (pickupFloors > 0) {
      const pickupCost = pickupFloors * PRICING_CONFIG.FLOOR_COST;
      totalCost += pickupHasLift
        ? pickupCost * PRICING_CONFIG.LIFT_DISCOUNT
        : pickupCost;
    }

    // Dropoff floors cost
    if (dropoffFloors > 0) {
      const dropoffCost = dropoffFloors * PRICING_CONFIG.FLOOR_COST;
      totalCost += dropoffHasLift
        ? dropoffCost * PRICING_CONFIG.LIFT_DISCOUNT
        : dropoffCost;
    }

    return totalCost;
  }

  private calculateLegacyHelpersCost(
    items: NormalizedItem[],
    helpersCount: number
  ): number {
    // Check if any items require two people
    const requiresTwoPerson = items.some(item => item.requiresTwoPerson);

    if (requiresTwoPerson && helpersCount === 0) {
      // Suggest adding a helper
      return PRICING_CONFIG.HELPER_COST;
    }

    return helpersCount * PRICING_CONFIG.HELPER_COST;
  }

  private checkIfHelpersRequired(items: NormalizedItem[]): boolean {
    return items.some(item => item.requiresTwoPerson);
  }

  private calculateLegacyExtrasCost(extras: {
    ulez: boolean;
    vat: boolean;
  }): number {
    let cost = 0;

    if (extras.ulez) {
      cost += PRICING_CONFIG.ULEZ_COST;
    }

    // VAT is calculated separately, not included in extras cost
    return cost;
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  private calculateTotalVolumeFactor(items: NormalizedItem[]): number {
    return items.reduce((total, item) => {
      return total + item.quantity * item.volumeFactor;
    }, 0);
  }

  private createEmptyBreakdown(): QuoteBreakdown {
    return {
      distanceBase: 0,
      totalVolumeFactor: 0,
      floorsCost: 0,
      helpersCost: 0,
      extrasCost: 0,
      vat: 0,
      total: 0,
    };
  }

  private generateCacheKey(request: PricingRequest): string {
    return JSON.stringify({
      distanceMiles: request.distanceMiles,
      items: request.items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        volumeFactor: item.volumeFactor,
      })),
      pickupFloors: request.pickupFloors,
      pickupHasLift: request.pickupHasLift,
      dropoffFloors: request.dropoffFloors,
      dropoffHasLift: request.dropoffHasLift,
      helpersCount: request.helpersCount,
      extras: request.extras,
      serviceType: request.serviceType,
      date: request.date?.toISOString().split('T')[0],
      timeSlot: request.timeSlot,
      promoCode: request.promoCode,
      pickupProperty: request.pickupProperty,
      dropoffProperty: request.dropoffProperty,
      isFirstTimeCustomer: request.isFirstTimeCustomer,
    });
  }

  private isCacheValid(cacheKey: string): boolean {
    const expiry = this.cacheExpiry.get(cacheKey);
    return expiry ? Date.now() < expiry : false;
  }

  // =============================================================================
  // PUBLIC UTILITY METHODS
  // =============================================================================

  public getPricingConstants() {
    return {
      ...PRICING_CONFIG,
      SERVICE_TYPES,
      PROMO_CODES,
    };
  }

  public getServiceTypes(): Record<string, ServiceType> {
    return { ...SERVICE_TYPES };
  }

  public getPromoCodes(): Record<string, PromoCode> {
    return { ...PROMO_CODES };
  }

  public validateItems(items: NormalizedItem[]): string[] {
    const errors: string[] = [];

    items.forEach((item, index) => {
      if (item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantity must be positive`);
      }

      if (item.volumeFactor < 0) {
        errors.push(`Item ${index + 1}: Volume factor cannot be negative`);
      }

      if (item.volumeFactor > 10) {
        errors.push(
          `Item ${index + 1}: Volume factor seems unusually high (${item.volumeFactor})`
        );
      }
    });

    return errors;
  }

  public estimateVolume(items: NormalizedItem[]): {
    totalVolume: number;
    volumeBreakdown: Array<{
      item: string;
      volume: number;
      percentage: number;
    }>;
  } {
    const totalVolume = this.calculateTotalVolumeFactor(items);
    const volumeBreakdown = items.map(item => ({
      item: item.canonicalName,
      volume: item.quantity * item.volumeFactor,
      percentage: ((item.quantity * item.volumeFactor) / totalVolume) * 100,
    }));

    return {
      totalVolume,
      volumeBreakdown: volumeBreakdown.sort((a, b) => b.volume - a.volume),
    };
  }

  public calculateServiceBasedPrice(
    serviceType: string,
    distanceMiles: number,
    estimatedHours: number = 2
  ): number {
    const service = SERVICE_TYPES[serviceType];
    if (!service) {
      throw new Error(`Invalid service type: ${serviceType}`);
    }

    let total = service.basePrice;

    // Add distance cost
    if (distanceMiles > PRICING_CONFIG.freeDistanceMiles) {
      const chargeableDistance =
        distanceMiles - PRICING_CONFIG.freeDistanceMiles;
      total += chargeableDistance * service.pricePerMile;
    }

    // Add time cost if applicable
    if (service.pricePerHour) {
      total +=
        Math.max(estimatedHours, PRICING_CONFIG.minimumDuration) *
        service.pricePerHour;
    }

    return total;
  }

  public applySeasonalMultiplier(date: Date): number {
    return this.getSeasonalMultiplier(date);
  }

  public calculateDemandMultiplier(date: Date, timeSlot?: string): number {
    return this.getDemandMultiplier(date, timeSlot);
  }

  public applySpecialItemSurcharges(items: NormalizedItem[]): number {
    const surcharges = this.calculateSpecialItemSurcharges(items);
    return surcharges.reduce((sum, s) => sum + s.amount, 0);
  }

  public calculateAccessSurcharges(
    pickupFloors: number,
    pickupHasLift: boolean,
    dropoffFloors: number,
    dropoffHasLift: boolean,
    pickupProperty?: { narrowAccess?: boolean; longCarry?: boolean },
    dropoffProperty?: { narrowAccess?: boolean; longCarry?: boolean }
  ): number {
    const surcharges = this.calculateAccessSurchargesArray(
      pickupFloors,
      pickupHasLift,
      dropoffFloors,
      dropoffHasLift,
      pickupProperty,
      dropoffProperty
    );
    return surcharges.reduce((sum, s) => sum + s.amount, 0);
  }
}

// =============================================================================
// LEGACY COMPATIBILITY FUNCTIONS
// =============================================================================

// Legacy function for backward compatibility
export async function computeQuote(
  inputs: PricingInputs
): Promise<PricingResponse> {
  const engine = new PricingEngine();
  return engine.calculateQuote(inputs);
}

// Convenience function for synchronous usage
export function computeQuoteSync(inputs: PricingInputs): PricingResponse {
  const engine = new PricingEngine();
  return engine.calculateQuote(inputs);
}

// =============================================================================
// EXPORT ALL NEW FEATURES
// =============================================================================

// Note: SERVICE_TYPES, PROMO_CODES, and PRICING_CONFIG are already exported above
// ServiceType, PromoCode, EnhancedBreakdown, and PricingRecommendations are already exported above
