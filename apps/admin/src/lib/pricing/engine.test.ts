// src/lib/pricing/engine.test.ts
// -----------------------------------------------------------------------------
// Comprehensive tests for the UNIFIED PRICING ENGINE
// Tests both legacy compatibility and new advanced features
// -----------------------------------------------------------------------------

import {
  PricingEngine,
  SERVICE_TYPES,
  PROMO_CODES,
  PRICING_CONFIG,
} from './engine';
import { NormalizedItem } from './types';

// =============================================================================
// TEST DATA
// =============================================================================

const mockItems: NormalizedItem[] = [
  {
    id: '1',
    canonicalName: 'Sofa',
    quantity: 1,
    volumeFactor: 2.5,
    requiresTwoPerson: true,
    isFragile: false,
    requiresDisassembly: false,
    basePriceHint: 0,
  },
  {
    id: '2',
    canonicalName: 'Piano',
    quantity: 1,
    volumeFactor: 4.0,
    requiresTwoPerson: true,
    isFragile: true,
    requiresDisassembly: false,
    basePriceHint: 0,
  },
  {
    id: '3',
    canonicalName: 'Boxes',
    quantity: 5,
    volumeFactor: 0.5,
    requiresTwoPerson: false,
    isFragile: false,
    requiresDisassembly: false,
    basePriceHint: 0,
  },
];

const mockLegacyRequest = {
  distanceMiles: 25,
  items: mockItems,
  pickupFloors: 2,
  pickupHasLift: false,
  dropoffFloors: 1,
  dropoffHasLift: true,
  helpersCount: 1,
  extras: {
    ulez: false,
    vat: true,
  },
};

const mockEnhancedRequest = {
  ...mockLegacyRequest,
  serviceType: 'man-and-van',
  date: new Date('2024-06-15'), // Summer (peak season)
  timeSlot: '09:00',
  pickupProperty: {
    narrowAccess: true,
    longCarry: false,
  },
  dropoffProperty: {
    narrowAccess: false,
    longCarry: true,
  },
  promoCode: 'FIRST20',
  isFirstTimeCustomer: true,
};

// =============================================================================
// TEST SUITE
// =============================================================================

describe('Unified Pricing Engine', () => {
  let engine: PricingEngine;

  beforeEach(() => {
    engine = new PricingEngine();
  });

  // =============================================================================
  // LEGACY COMPATIBILITY TESTS
  // =============================================================================

  describe('Legacy Compatibility', () => {
    test('should calculate legacy pricing correctly', () => {
      const result = engine.calculateQuote(mockLegacyRequest);

      expect(result.success).toBe(true);
      expect(result.breakdown).toBeDefined();
      expect(result.breakdown.total).toBeGreaterThan(0);
      expect(result.requiresHelpers).toBe(true);
      expect(result.suggestions).toContain(
        'Consider adding helpers for items requiring two people'
      );
    });

    test('should maintain legacy API compatibility', () => {
      const result = engine.calculateQuote(mockLegacyRequest);

      // Legacy breakdown structure
      expect(result.breakdown).toHaveProperty('distanceBase');
      expect(result.breakdown).toHaveProperty('totalVolumeFactor');
      expect(result.breakdown).toHaveProperty('floorsCost');
      expect(result.breakdown).toHaveProperty('helpersCost');
      expect(result.breakdown).toHaveProperty('extrasCost');
      expect(result.breakdown).toHaveProperty('vat');
      expect(result.breakdown).toHaveProperty('total');
    });

    test('should apply minimum total for small bookings', () => {
      const smallRequest = {
        ...mockLegacyRequest,
        distanceMiles: 2,
        items: [mockItems[2]], // Just boxes
        pickupFloors: 0,
        dropoffFloors: 0,
        helpersCount: 0,
      };

      const result = engine.calculateQuote(smallRequest);
      expect(result.breakdown.total).toBe(PRICING_CONFIG.MINIMUM_TOTAL);
      expect(result.suggestions).toContain(
        `Minimum charge of £${PRICING_CONFIG.MINIMUM_TOTAL} applied`
      );
    });

    test('should calculate floor costs correctly', () => {
      const result = engine.calculateQuote(mockLegacyRequest);

      // Pickup: 2 floors without lift = 2 * £10 = £20
      // Dropoff: 1 floor with lift = 1 * £10 * 0.6 = £6
      const expectedFloorsCost =
        2 * PRICING_CONFIG.FLOOR_COST +
        1 * PRICING_CONFIG.FLOOR_COST * PRICING_CONFIG.LIFT_DISCOUNT;
      expect(result.breakdown.floorsCost).toBe(expectedFloorsCost);
    });

    test('should calculate helper costs correctly', () => {
      const result = engine.calculateQuote(mockLegacyRequest);

      // 1 helper requested + 1 required for piano = 2 helpers total
      const expectedHelpersCost = 2 * PRICING_CONFIG.HELPER_COST;
      expect(result.breakdown.helpersCost).toBe(expectedHelpersCost);
    });
  });

  // =============================================================================
  // ENHANCED FEATURES TESTS
  // =============================================================================

  describe('Enhanced Features', () => {
    test('should provide enhanced breakdown for new features', () => {
      const result = engine.calculateQuote(mockEnhancedRequest);

      expect(result.enhancedBreakdown).toBeDefined();
      expect(result.enhancedBreakdown?.baseFee).toBe(PRICING_CONFIG.baseFee);
      expect(result.enhancedBreakdown?.serviceCharge).toBe(
        SERVICE_TYPES['man-and-van'].basePrice
      );
      expect(result.enhancedBreakdown?.serviceMultiplier).toBe(1.0);
    });

    test('should apply service-based pricing', () => {
      const vanOnlyRequest = {
        ...mockEnhancedRequest,
        serviceType: 'van-only',
      };
      const manAndVanRequest = {
        ...mockEnhancedRequest,
        serviceType: 'man-and-van',
      };

      const vanOnlyResult = engine.calculateQuote(vanOnlyRequest);
      const manAndVanResult = engine.calculateQuote(manAndVanRequest);

      // Van-only should be cheaper
      expect(vanOnlyResult.enhancedBreakdown?.serviceCharge).toBeLessThan(
        manAndVanResult.enhancedBreakdown?.serviceCharge
      );
    });

    test('should apply seasonal multipliers', () => {
      const summerRequest = {
        ...mockEnhancedRequest,
        date: new Date('2024-06-15'),
      }; // Summer
      const winterRequest = {
        ...mockEnhancedRequest,
        date: new Date('2024-01-15'),
      }; // Winter

      const summerResult = engine.calculateQuote(summerRequest);
      const winterResult = engine.calculateQuote(winterRequest);

      expect(summerResult.enhancedBreakdown?.seasonalMultiplier).toBe(
        PRICING_CONFIG.seasonalMultipliers.peak
      );
      expect(winterResult.enhancedBreakdown?.seasonalMultiplier).toBe(
        PRICING_CONFIG.seasonalMultipliers.normal
      );
    });

    test('should apply time slot multipliers', () => {
      const peakTimeRequest = { ...mockEnhancedRequest, timeSlot: '09:00' }; // Peak time
      const offPeakRequest = { ...mockEnhancedRequest, timeSlot: '14:00' }; // Off-peak time

      const peakResult = engine.calculateQuote(peakTimeRequest);
      const offPeakResult = engine.calculateQuote(offPeakRequest);

      expect(peakResult.enhancedBreakdown?.timeSlotMultiplier).toBe(1.15);
      expect(offPeakResult.enhancedBreakdown?.timeSlotMultiplier).toBe(0.95);
    });

    test('should apply demand multipliers for weekends', () => {
      const weekendRequest = {
        ...mockEnhancedRequest,
        date: new Date('2024-06-15'),
      }; // Saturday
      const weekdayRequest = {
        ...mockEnhancedRequest,
        date: new Date('2024-06-17'),
      }; // Monday

      const weekendResult = engine.calculateQuote(weekendRequest);
      const weekdayResult = engine.calculateQuote(weekdayRequest);

      expect(weekendResult.enhancedBreakdown?.demandMultiplier).toBe(
        PRICING_CONFIG.demandMultipliers.high
      );
      expect(weekdayResult.enhancedBreakdown?.demandMultiplier).toBe(
        PRICING_CONFIG.demandMultipliers.medium
      );
    });

    test('should calculate special item surcharges', () => {
      const result = engine.calculateQuote(mockEnhancedRequest);

      const pianoSurcharge =
        result.enhancedBreakdown?.specialItemSurcharges.find(
          s => s.name === 'Piano handling'
        );
      expect(pianoSurcharge).toBeDefined();
      expect(pianoSurcharge?.amount).toBe(
        PRICING_CONFIG.specialItemSurcharges.piano
      );
    });

    test('should calculate access surcharges', () => {
      const result = engine.calculateQuote(mockEnhancedRequest);

      const narrowAccessSurcharge =
        result.enhancedBreakdown?.accessSurcharges.find(
          s => s.name === 'Pickup narrow access'
        );
      const longCarrySurcharge =
        result.enhancedBreakdown?.accessSurcharges.find(
          s => s.name === 'Dropoff long carry'
        );

      expect(narrowAccessSurcharge).toBeDefined();
      expect(narrowAccessSurcharge?.amount).toBe(
        PRICING_CONFIG.accessSurcharges.narrowAccess
      );
      expect(longCarrySurcharge).toBeDefined();
      expect(longCarrySurcharge?.amount).toBe(
        PRICING_CONFIG.accessSurcharges.longCarry
      );
    });

    test('should apply promotional codes', () => {
      const result = engine.calculateQuote(mockEnhancedRequest);

      expect(result.enhancedBreakdown?.promoDiscount).toBeGreaterThan(0);
      expect(result.enhancedBreakdown?.subtotalBeforeVAT).toBeLessThan(
        result.enhancedBreakdown?.finalTotal! +
          result.enhancedBreakdown?.promoDiscount!
      );
    });

    test('should provide pricing recommendations', () => {
      const result = engine.calculateQuote(mockEnhancedRequest);

      expect(result.recommendations).toBeDefined();
      expect(result.recommendations?.potentialSavings).toBeDefined();
      expect(result.recommendations?.upgradeOptions).toBeDefined();
    });
  });

  // =============================================================================
  // VOLUME AND DISTANCE CALCULATIONS
  // =============================================================================

  describe('Volume and Distance Calculations', () => {
    test('should calculate total volume correctly', () => {
      const result = engine.calculateQuote(mockLegacyRequest);

      // Sofa: 1 * 2.5 = 2.5
      // Piano: 1 * 4.0 = 4.0
      // Boxes: 5 * 0.5 = 2.5
      // Total: 9.0
      expect(result.breakdown.totalVolumeFactor).toBe(9.0);
    });

    test('should apply volume discounts for large bookings', () => {
      const largeVolumeItems: NormalizedItem[] = Array.from(
        { length: 20 },
        (_, i) => ({
          id: `large-${i}`,
          canonicalName: 'Large Item',
          quantity: 1,
          volumeFactor: 1.0,
          requiresTwoPerson: false,
          isFragile: false,
          requiresDisassembly: false,
          basePriceHint: 0,
        })
      );

      const largeRequest = { ...mockLegacyRequest, items: largeVolumeItems };
      const result = engine.calculateQuote(largeRequest);

      expect(result.suggestions).toContain(
        'Volume discount applied: 10% off for large bookings'
      );
    });

    test('should calculate distance-based pricing correctly', () => {
      const shortDistanceRequest = { ...mockLegacyRequest, distanceMiles: 3 };
      const mediumDistanceRequest = { ...mockLegacyRequest, distanceMiles: 25 };
      const longDistanceRequest = { ...mockLegacyRequest, distanceMiles: 75 };

      const shortResult = engine.calculateQuote(shortDistanceRequest);
      const mediumResult = engine.calculateQuote(mediumDistanceRequest);
      const longResult = engine.calculateQuote(longDistanceRequest);

      // Short distance should get free allowance
      expect(shortResult.suggestions).toContain(
        'Free distance allowance applied'
      );

      // Long distance should get surcharge
      expect(longResult.suggestions).toContain(
        'Long distance surcharge applied'
      );
    });
  });

  // =============================================================================
  // SERVICE TYPE VALIDATION
  // =============================================================================

  describe('Service Type Validation', () => {
    test('should validate service types correctly', () => {
      const validServiceTypes = Object.keys(SERVICE_TYPES);

      validServiceTypes.forEach(serviceType => {
        const request = { ...mockEnhancedRequest, serviceType };
        const result = engine.calculateQuote(request);
        expect(result.success).toBe(true);
      });
    });

    test('should reject invalid service types', () => {
      const invalidRequest = {
        ...mockEnhancedRequest,
        serviceType: 'invalid-service',
      };

      expect(() => {
        engine.calculateQuote(invalidRequest);
      }).toThrow('Invalid service type: invalid-service');
    });

    test('should provide service information', () => {
      const serviceTypes = engine.getServiceTypes();

      expect(serviceTypes['man-and-van']).toBeDefined();
      expect(serviceTypes['man-and-van'].name).toBe('Man & Van');
      expect(serviceTypes['man-and-van'].crewSize).toBe(2);
    });
  });

  // =============================================================================
  // PROMOTIONAL CODE TESTS
  // =============================================================================

  describe('Promotional Codes', () => {
    test('should apply valid promotional codes', () => {
      const result = engine.calculateQuote(mockEnhancedRequest);

      expect(result.enhancedBreakdown?.promoDiscount).toBeGreaterThan(0);
    });

    test('should reject invalid promotional codes', () => {
      const invalidPromoRequest = {
        ...mockEnhancedRequest,
        promoCode: 'INVALID',
      };
      const result = engine.calculateQuote(invalidPromoRequest);

      expect(result.enhancedBreakdown?.promoDiscount).toBe(0);
    });

    test('should respect promotional code conditions', () => {
      const nonFirstTimeRequest = {
        ...mockEnhancedRequest,
        isFirstTimeCustomer: false,
      };
      const result = engine.calculateQuote(nonFirstTimeRequest);

      // FIRST20 should not apply to non-first-time customers
      expect(result.enhancedBreakdown?.promoDiscount).toBe(0);
    });

    test('should provide promotional code information', () => {
      const promoCodes = engine.getPromoCodes();

      expect(promoCodes.FIRST20).toBeDefined();
      expect(promoCodes.FIRST20.description).toBe('20% off your first booking');
    });
  });

  // =============================================================================
  // CACHING TESTS
  // =============================================================================

  describe('Caching', () => {
    test('should cache results for identical requests', () => {
      const result1 = engine.calculateQuote(mockEnhancedRequest);
      const result2 = engine.calculateQuote(mockEnhancedRequest);

      // Should return cached result
      expect(result1).toBe(result2);
    });

    test('should generate different cache keys for different requests', () => {
      const request1 = { ...mockEnhancedRequest, distanceMiles: 25 };
      const request2 = { ...mockEnhancedRequest, distanceMiles: 30 };

      const result1 = engine.calculateQuote(request1);
      const result2 = engine.calculateQuote(request2);

      // Should return different results
      expect(result1.breakdown.total).not.toBe(result2.breakdown.total);
    });
  });

  // =============================================================================
  // UTILITY METHOD TESTS
  // =============================================================================

  describe('Utility Methods', () => {
    test('should calculate service-based prices', () => {
      const price = engine.calculateServiceBasedPrice('man-and-van', 25, 3);

      expect(price).toBeGreaterThan(0);
      expect(price).toBe(
        SERVICE_TYPES['man-and-van'].basePrice +
          20 * SERVICE_TYPES['man-and-van'].pricePerMile +
          3 * SERVICE_TYPES['man-and-van'].pricePerHour!
      );
    });

    test('should apply seasonal multipliers', () => {
      const summerMultiplier = engine.applySeasonalMultiplier(
        new Date('2024-06-15')
      );
      const winterMultiplier = engine.applySeasonalMultiplier(
        new Date('2024-01-15')
      );

      expect(summerMultiplier).toBe(PRICING_CONFIG.seasonalMultipliers.peak);
      expect(winterMultiplier).toBe(PRICING_CONFIG.seasonalMultipliers.normal);
    });

    test('should calculate demand multipliers', () => {
      const weekendMultiplier = engine.calculateDemandMultiplier(
        new Date('2024-06-15'),
        '10:00'
      );
      const weekdayMultiplier = engine.calculateDemandMultiplier(
        new Date('2024-06-17'),
        '10:00'
      );

      expect(weekendMultiplier).toBe(PRICING_CONFIG.demandMultipliers.high);
      expect(weekdayMultiplier).toBe(PRICING_CONFIG.demandMultipliers.medium);
    });

    test('should calculate special item surcharges', () => {
      const surchargeTotal = engine.applySpecialItemSurcharges(mockItems);

      expect(surchargeTotal).toBeGreaterThan(0);
      // Should include piano surcharge
      expect(surchargeTotal).toBeGreaterThanOrEqual(
        PRICING_CONFIG.specialItemSurcharges.piano
      );
    });

    test('should calculate access surcharges', () => {
      const surchargeTotal = engine.calculateAccessSurcharges(
        2,
        false,
        1,
        true,
        { narrowAccess: true, longCarry: false },
        { narrowAccess: false, longCarry: true }
      );

      expect(surchargeTotal).toBeGreaterThan(0);
    });

    test('should validate items correctly', () => {
      const validItems: NormalizedItem[] = [
        { ...mockItems[0], quantity: 1, volumeFactor: 2.5 },
      ];

      const invalidItems: NormalizedItem[] = [
        { ...mockItems[0], quantity: 0, volumeFactor: -1 },
      ];

      const validErrors = engine.validateItems(validItems);
      const invalidErrors = engine.validateItems(invalidItems);

      expect(validErrors).toHaveLength(0);
      expect(invalidErrors).toHaveLength(2);
    });

    test('should estimate volume correctly', () => {
      const volumeEstimate = engine.estimateVolume(mockItems);

      expect(volumeEstimate.totalVolume).toBe(9.0);
      expect(volumeEstimate.volumeBreakdown).toHaveLength(3);
      expect(volumeEstimate.volumeBreakdown[0].item).toBe('Piano'); // Highest volume
    });
  });

  // =============================================================================
  // CONFIGURATION TESTS
  // =============================================================================

  describe('Configuration', () => {
    test('should provide pricing constants', () => {
      const constants = engine.getPricingConstants();

      expect(constants).toHaveProperty('baseFee');
      expect(constants).toHaveProperty('vatRate');
      expect(constants).toHaveProperty('SERVICE_TYPES');
      expect(constants).toHaveProperty('PROMO_CODES');
    });

    test('should maintain legacy constants', () => {
      const constants = engine.getPricingConstants();

      expect(constants).toHaveProperty('SHORT_DISTANCE');
      expect(constants).toHaveProperty('MEDIUM_DISTANCE');
      expect(constants).toHaveProperty('FLOOR_COST');
      expect(constants).toHaveProperty('HELPER_COST');
    });
  });

  // =============================================================================
  // ERROR HANDLING TESTS
  // =============================================================================

  describe('Error Handling', () => {
    test('should handle negative distances', () => {
      const invalidRequest = { ...mockLegacyRequest, distanceMiles: -5 };
      const result = engine.calculateQuote(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Distance cannot be negative');
    });

    test('should handle empty item lists', () => {
      const invalidRequest = { ...mockLegacyRequest, items: [] };
      const result = engine.calculateQuote(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('At least one item is required');
    });

    test('should handle negative floor numbers', () => {
      const invalidRequest = { ...mockLegacyRequest, pickupFloors: -1 };
      const result = engine.calculateQuote(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Floor numbers cannot be negative');
    });

    test('should handle negative helper counts', () => {
      const invalidRequest = { ...mockLegacyRequest, helpersCount: -1 };
      const result = engine.calculateQuote(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Helper count cannot be negative');
    });
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

describe('Pricing Engine Integration', () => {
  let engine: PricingEngine;

  beforeEach(() => {
    engine = new PricingEngine();
  });

  test('should handle complex real-world scenarios', () => {
    const complexRequest = {
      distanceMiles: 45,
      items: [
        {
          id: '1',
          canonicalName: 'Grand Piano',
          quantity: 1,
          volumeFactor: 5.0,
          requiresTwoPerson: true,
          isFragile: true,
          requiresDisassembly: false,
          basePriceHint: 0,
        },
        {
          id: '2',
          canonicalName: 'Antique Furniture',
          quantity: 3,
          volumeFactor: 2.0,
          requiresTwoPerson: true,
          isFragile: true,
          requiresDisassembly: true,
          basePriceHint: 0,
        },
      ],
      pickupFloors: 3,
      pickupHasLift: false,
      dropoffFloors: 2,
      dropoffHasLift: true,
      helpersCount: 2,
      extras: { ulez: true, vat: true },
      serviceType: 'premium',
      date: new Date('2024-12-20'), // Christmas (peak season)
      timeSlot: '09:00', // Peak time
      pickupProperty: { narrowAccess: true, longCarry: true },
      dropoffProperty: { narrowAccess: false, longCarry: false },
      promoCode: 'SAVE15',
      isFirstTimeCustomer: false,
    };

    const result = engine.calculateQuote(complexRequest);

    expect(result.success).toBe(true);
    expect(result.enhancedBreakdown).toBeDefined();
    expect(result.enhancedBreakdown?.serviceMultiplier).toBe(1.5); // Premium service
    expect(result.enhancedBreakdown?.seasonalMultiplier).toBe(1.2); // Christmas
    expect(result.enhancedBreakdown?.timeSlotMultiplier).toBe(1.15); // Peak time
    expect(result.enhancedBreakdown?.demandMultiplier).toBe(1.15); // Weekend
    expect(
      result.enhancedBreakdown?.specialItemSurcharges.length
    ).toBeGreaterThan(0);
    expect(result.enhancedBreakdown?.accessSurcharges.length).toBeGreaterThan(
      0
    );
    expect(result.enhancedBreakdown?.promoDiscount).toBeGreaterThan(0);
  });
});
