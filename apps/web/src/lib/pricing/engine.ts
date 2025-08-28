// src/lib/pricing/engine.ts
// -----------------------------------------------------------------------------
// Enhanced pricing engine for Speedy Van (UK market) with volume factor system.
// Currency: GBP (£). Distance unit: miles.
// Implements: distance-based pricing × volume factor + floors + helpers + extras + VAT.
// -----------------------------------------------------------------------------

import { NormalizedItem, QuoteBreakdown } from './types';

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

export interface PricingRequest {
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

export interface PricingResponse {
  success: boolean;
  breakdown: QuoteBreakdown;
  requiresHelpers: boolean;
  suggestions: string[];
  errors?: string[];
}

export class PricingEngine {
  private static readonly BASE_PRICES = {
    SHORT_DISTANCE: 40,    // 0-10 miles
    MEDIUM_DISTANCE: 60,   // 10-50 miles
    LONG_DISTANCE_RATE: 1.20, // £1.20 per mile beyond 50
    LONG_DISTANCE_THRESHOLD: 50
  };

  private static readonly FLOOR_COST = 10; // £10 per floor without lift
  private static readonly LIFT_DISCOUNT = 0.6; // 60% discount with lift
  private static readonly HELPER_COST = 20; // £20 per helper
  private static readonly ULEZ_COST = 12.50; // £12.50 ULEZ charge
  private static readonly VAT_RATE = 0.20; // 20% VAT
  private static readonly MINIMUM_TOTAL = 55; // £55 minimum

  public calculateQuote(request: PricingRequest): PricingResponse {
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
        errors
      };
    }

    try {
      // Calculate base price based on distance
      const distanceBase = this.calculateDistanceBase(request.distanceMiles);

      // Calculate total volume factor
      const totalVolumeFactor = this.calculateTotalVolumeFactor(request.items);

      // Calculate floors cost
      const floorsCost = this.calculateFloorsCost(
        request.pickupFloors,
        request.pickupHasLift,
        request.dropoffFloors,
        request.dropoffHasLift
      );

      // Calculate helpers cost
      const helpersCost = this.calculateHelpersCost(request.items, request.helpersCount);

      // Check if helpers are required but not provided
      const requiresHelpers = this.checkIfHelpersRequired(request.items) && request.helpersCount === 0;
      if (requiresHelpers) {
        suggestions.push('Consider adding helpers for items requiring two people');
      }

      // Calculate extras cost
      const extrasCost = this.calculateExtrasCost(request.extras);

      // Calculate subtotal
      const subtotal = distanceBase * totalVolumeFactor + floorsCost + helpersCost + extrasCost;

      // Apply VAT if required
      const vat = request.extras.vat ? subtotal * PricingEngine.VAT_RATE : 0;

      // Calculate final total
      let total = subtotal + vat;

      // Apply minimum total
      if (total < PricingEngine.MINIMUM_TOTAL) {
        total = PricingEngine.MINIMUM_TOTAL;
        suggestions.push(`Minimum charge of £${PricingEngine.MINIMUM_TOTAL} applied`);
      }

      const breakdown: QuoteBreakdown = {
        distanceBase,
        totalVolumeFactor,
        floorsCost,
        helpersCost,
        extrasCost,
        vat,
        total
      };

      return {
        success: true,
        breakdown,
        requiresHelpers,
        suggestions,
        errors: []
      };

    } catch (error) {
      return {
        success: false,
        breakdown: this.createEmptyBreakdown(),
        requiresHelpers: false,
        suggestions: [],
        errors: [`Calculation error: ${error}`]
      };
    }
  }

  private calculateDistanceBase(distanceMiles: number): number {
    if (distanceMiles <= 10) {
      return PricingEngine.BASE_PRICES.SHORT_DISTANCE;
    } else if (distanceMiles <= 50) {
      return PricingEngine.BASE_PRICES.MEDIUM_DISTANCE;
    } else {
      const baseCost = PricingEngine.BASE_PRICES.MEDIUM_DISTANCE;
      const additionalMiles = distanceMiles - PricingEngine.BASE_PRICES.LONG_DISTANCE_THRESHOLD;
      const additionalCost = additionalMiles * PricingEngine.BASE_PRICES.LONG_DISTANCE_RATE;
      return baseCost + additionalCost;
    }
  }

  private calculateTotalVolumeFactor(items: NormalizedItem[]): number {
    return items.reduce((total, item) => {
      return total + (item.quantity * item.volumeFactor);
    }, 0);
  }

  private calculateFloorsCost(
    pickupFloors: number,
    pickupHasLift: boolean,
    dropoffFloors: number,
    dropoffHasLift: boolean
  ): number {
    let totalCost = 0;

    // Pickup floors cost
    if (pickupFloors > 0) {
      const pickupCost = pickupFloors * PricingEngine.FLOOR_COST;
      totalCost += pickupHasLift ? pickupCost * PricingEngine.LIFT_DISCOUNT : pickupCost;
    }

    // Dropoff floors cost
    if (dropoffFloors > 0) {
      const dropoffCost = dropoffFloors * PricingEngine.FLOOR_COST;
      totalCost += dropoffHasLift ? dropoffCost * PricingEngine.LIFT_DISCOUNT : dropoffCost;
    }

    return totalCost;
  }

  private calculateHelpersCost(items: NormalizedItem[], helpersCount: number): number {
    // Check if any items require two people
    const requiresTwoPerson = items.some(item => item.requiresTwoPerson);
    
    if (requiresTwoPerson && helpersCount === 0) {
      // Suggest adding a helper
      return PricingEngine.HELPER_COST;
    }

    return helpersCount * PricingEngine.HELPER_COST;
  }

  private checkIfHelpersRequired(items: NormalizedItem[]): boolean {
    return items.some(item => item.requiresTwoPerson);
  }

  private calculateExtrasCost(extras: { ulez: boolean; vat: boolean }): number {
    let cost = 0;

    if (extras.ulez) {
      cost += PricingEngine.ULEZ_COST;
    }

    // VAT is calculated separately, not included in extras cost
    return cost;
  }

  private createEmptyBreakdown(): QuoteBreakdown {
    return {
      distanceBase: 0,
      totalVolumeFactor: 0,
      floorsCost: 0,
      helpersCost: 0,
      extrasCost: 0,
      vat: 0,
      total: 0
    };
  }

  // Utility methods for testing and debugging
  public getPricingConstants() {
    return {
      BASE_PRICES: PricingEngine.BASE_PRICES,
      FLOOR_COST: PricingEngine.FLOOR_COST,
      LIFT_DISCOUNT: PricingEngine.LIFT_DISCOUNT,
      HELPER_COST: PricingEngine.HELPER_COST,
      ULEZ_COST: PricingEngine.ULEZ_COST,
      VAT_RATE: PricingEngine.VAT_RATE,
      MINIMUM_TOTAL: PricingEngine.MINIMUM_TOTAL
    };
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
        errors.push(`Item ${index + 1}: Volume factor seems unusually high (${item.volumeFactor})`);
      }
    });

    return errors;
  }

  public estimateVolume(items: NormalizedItem[]): {
    totalVolume: number;
    volumeBreakdown: Array<{ item: string; volume: number; percentage: number }>;
  } {
    const totalVolume = this.calculateTotalVolumeFactor(items);
    const volumeBreakdown = items.map(item => ({
      item: item.canonicalName,
      volume: item.quantity * item.volumeFactor,
      percentage: ((item.quantity * item.volumeFactor) / totalVolume) * 100
    }));

    return {
      totalVolume,
      volumeBreakdown: volumeBreakdown.sort((a, b) => b.volume - a.volume)
    };
  }
}

// Legacy function for backward compatibility
export async function computeQuote(inputs: PricingInputs): Promise<PricingResponse> {
  const engine = new PricingEngine();
  return engine.calculateQuote(inputs);
}

// Convenience function for synchronous usage
export function computeQuoteSync(inputs: PricingInputs): PricingResponse {
  const engine = new PricingEngine();
  return engine.calculateQuote(inputs);
}
