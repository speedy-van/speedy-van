import { PricingEngine } from '../pricing-engine';
import { EnhancedTimeSlot, SERVICE_TYPES, PricingPropertyDetails } from '../types';
import { BookingItem, PropertyDetails } from '../schemas';

describe('PricingEngine', () => {
  let pricingEngine: PricingEngine;

  beforeEach(() => {
    pricingEngine = new PricingEngine();
  });

  describe('Basic Pricing Calculation', () => {
    const mockItems: BookingItem[] = [
      {
        id: '1',
        name: 'Sofa',
        category: 'furniture',
        volume: 2.5,
        weight: 50,
        quantity: 1,
        fragile: false,
        valuable: false,
      },
      {
        id: '2',
        name: 'Box (Small)',
        category: 'boxes',
        volume: 0.1,
        weight: 5,
        quantity: 10,
        fragile: false,
        valuable: false,
      },
    ];

    const mockTimeSlot: EnhancedTimeSlot = {
      id: 'mock-time-slot',
      startTime: '09:00',
      endTime: '11:00',
      available: true,
      price: 25,
      popular: true,
      recommended: true,
      type: 'morning',
      multiplier: 1.0,
      demand: 'medium',
    };

    const mockProperty: PricingPropertyDetails = {
      type: 'house',
      floor: 0,
      hasLift: false,
      narrowAccess: false,
    };

    test('calculates basic pricing correctly', () => {
      const result = pricingEngine.calculatePricing({
        items: mockItems,
        serviceType: 'man-and-van',
        distance: 10,
        estimatedDuration: 3,
        timeSlot: mockTimeSlot,
        date: new Date('2024-06-15'),
        pickupProperty: mockProperty,
        dropoffProperty: mockProperty,
        isFirstTimeCustomer: false,
      });

      expect(result.basePrice).toBe(25);
      expect(result.servicePrice).toBe(45);
      expect(result.total).toBeGreaterThan(100);
      expect(result.vat).toBe(result.subtotal * 0.2);
    });

    test('applies volume-based pricing', () => {
      const smallVolumeItems: BookingItem[] = [
        {
          id: '1',
          name: 'Small Box',
          category: 'boxes',
          volume: 0.1,
          weight: 2,
          quantity: 1,
          fragile: false,
          valuable: false,
        },
      ];

      const largeVolumeItems: BookingItem[] = [
        {
          id: '1',
          name: 'Large Furniture',
          category: 'furniture',
          volume: 10,
          weight: 100,
          quantity: 1,
          fragile: false,
          valuable: false,
        },
      ];

      const smallResult = pricingEngine.calculatePricing({
        items: smallVolumeItems,
        serviceType: 'man-and-van',
        distance: 5,
        estimatedDuration: 2,
        timeSlot: mockTimeSlot,
        date: new Date('2024-06-15'),
        pickupProperty: mockProperty,
        dropoffProperty: mockProperty,
        isFirstTimeCustomer: false,
      });

      const largeResult = pricingEngine.calculatePricing({
        items: largeVolumeItems,
        serviceType: 'man-and-van',
        distance: 5,
        estimatedDuration: 2,
        timeSlot: mockTimeSlot,
        date: new Date('2024-06-15'),
        pickupProperty: mockProperty,
        dropoffProperty: mockProperty,
        isFirstTimeCustomer: false,
      });

      expect(largeResult.total).toBeGreaterThan(smallResult.total);
    });

    test('applies distance-based pricing', () => {
      const shortDistanceResult = pricingEngine.calculatePricing({
        items: mockItems,
        serviceType: 'man-and-van',
        distance: 3,
        estimatedDuration: 2,
        timeSlot: mockTimeSlot,
        date: new Date('2024-06-15'),
        pickupProperty: mockProperty,
        dropoffProperty: mockProperty,
        isFirstTimeCustomer: false,
      });

      const longDistanceResult = pricingEngine.calculatePricing({
        items: mockItems,
        serviceType: 'man-and-van',
        distance: 20,
        estimatedDuration: 2,
        timeSlot: mockTimeSlot,
        date: new Date('2024-06-15'),
        pickupProperty: mockProperty,
        dropoffProperty: mockProperty,
        isFirstTimeCustomer: false,
      });

      expect(longDistanceResult.total).toBeGreaterThan(shortDistanceResult.total);
    });

    test('applies service type multipliers', () => {
      const manAndVanResult = pricingEngine.calculatePricing({
        items: mockItems,
        serviceType: 'man-and-van',
        distance: 5,
        estimatedDuration: 2,
        timeSlot: mockTimeSlot,
        date: new Date('2024-06-15'),
        pickupProperty: mockProperty,
        dropoffProperty: mockProperty,
        isFirstTimeCustomer: false,
      });

      const vanOnlyResult = pricingEngine.calculatePricing({
        items: mockItems,
        serviceType: 'van-only',
        distance: 5,
        estimatedDuration: 2,
        timeSlot: mockTimeSlot,
        date: new Date('2024-06-15'),
        pickupProperty: mockProperty,
        dropoffProperty: mockProperty,
        isFirstTimeCustomer: false,
      });

      expect(manAndVanResult.total).toBeGreaterThan(vanOnlyResult.total);
    });
  });

  describe('Surcharges and Discounts', () => {
    const mockItems: BookingItem[] = [
      {
        id: '1',
        name: 'Fragile Vase',
        category: 'furniture',
        volume: 0.5,
        weight: 10,
        quantity: 1,
        fragile: true,
        valuable: true,
      },
    ];

    const mockTimeSlot: EnhancedTimeSlot = {
      id: 'mock-time-slot',
      startTime: '17:00',
      endTime: '19:00',
      available: true,
      price: 0,
      popular: true,
      recommended: true,
      type: 'evening',
      multiplier: 1.0,
      demand: 'high',
    };

    test('applies fragile item surcharge', () => {
      const fragileProperty: PricingPropertyDetails = {
        type: 'flat',
        floor: 3,
        hasLift: false,
        narrowAccess: true,
      };

      const result = pricingEngine.calculatePricing({
        items: mockItems,
        serviceType: 'man-and-van',
        distance: 5,
        estimatedDuration: 2,
        timeSlot: mockTimeSlot,
        date: new Date('2024-06-15'),
        pickupProperty: fragileProperty,
        dropoffProperty: fragileProperty,
        isFirstTimeCustomer: false,
      });

      const fragileItemSurcharge = result.surcharges.find(s =>
        s.name.includes('Fragile')
      );
      const floorSurcharge = result.surcharges.find(s =>
        s.name.includes('Floor')
      );
      const narrowAccessSurcharge = result.surcharges.find(s =>
        s.name.includes('Narrow')
      );

      expect(fragileItemSurcharge).toBeDefined();
      expect(floorSurcharge).toBeDefined();
      expect(narrowAccessSurcharge).toBeDefined();
    });

    test('applies peak time surcharge', () => {
      const peakTimeSlot: EnhancedTimeSlot = {
        id: 'mock-time-slot',
        startTime: '08:00',
        endTime: '10:00',
        available: true,
        price: 0,
        popular: true,
        recommended: true,
        type: 'morning',
        multiplier: 1.0,
        demand: 'high',
      };

      const result = pricingEngine.calculatePricing({
        items: mockItems,
        serviceType: 'man-and-van',
        distance: 5,
        estimatedDuration: 2,
        timeSlot: peakTimeSlot,
        date: new Date('2024-06-17'), // Monday
        pickupProperty: {
          type: 'house',
          floor: 0,
          hasLift: false,
          narrowAccess: false,
        },
        dropoffProperty: {
          type: 'house',
          floor: 0,
          hasLift: false,
          narrowAccess: false,
        },
        isFirstTimeCustomer: false,
      });

      const peakSurcharge = result.surcharges.find(s =>
        s.name.includes('Peak')
      );
      expect(peakSurcharge).toBeDefined();
    });

    test('applies weekend surcharge', () => {
      const result = pricingEngine.calculatePricing({
        items: mockItems,
        serviceType: 'man-and-van',
        distance: 5,
        estimatedDuration: 2,
        timeSlot: mockTimeSlot,
        date: new Date('2024-06-16'), // Sunday
        pickupProperty: {
          type: 'house',
          floor: 0,
          hasLift: false,
          narrowAccess: false,
        },
        dropoffProperty: {
          type: 'house',
          floor: 0,
          hasLift: false,
          narrowAccess: false,
        },
        isFirstTimeCustomer: false,
      });

      const weekendSurcharge = result.surcharges.find(s =>
        s.name.includes('Weekend')
      );
      expect(weekendSurcharge).toBeDefined();
    });
  });

  describe('Promotional Codes', () => {
    const mockItems: BookingItem[] = [
      {
        id: '1',
        name: 'Test Item',
        category: 'furniture',
        volume: 1,
        weight: 20,
        quantity: 1,
        fragile: false,
        valuable: false,
      },
    ];

    const mockTimeSlot: EnhancedTimeSlot = {
      id: 'mock-time-slot',
      startTime: '10:00',
      endTime: '12:00',
      available: true,
      price: 0,
      popular: false,
      recommended: false,
      type: 'morning',
      multiplier: 1.0,
      demand: 'medium',
    };

    const mockProperty: PricingPropertyDetails = {
      type: 'house',
      floor: 0,
      hasLift: false,
      narrowAccess: false,
    };

    test('applies first-time customer discount', () => {
      const result = pricingEngine.calculatePricing({
        items: mockItems,
        serviceType: 'man-and-van',
        distance: 5,
        estimatedDuration: 2,
        timeSlot: mockTimeSlot,
        date: new Date('2024-06-15'),
        pickupProperty: mockProperty,
        dropoffProperty: mockProperty,
        isFirstTimeCustomer: true,
      });

      const firstTimeDiscount = result.discounts.find(d =>
        d.name.includes('First')
      );
      expect(firstTimeDiscount).toBeDefined();
    });

    test('applies valid promotional code', () => {
      const result = pricingEngine.calculatePricing({
        items: mockItems,
        serviceType: 'man-and-van',
        distance: 5,
        estimatedDuration: 2,
        timeSlot: mockTimeSlot,
        date: new Date('2024-06-15'),
        pickupProperty: mockProperty,
        dropoffProperty: mockProperty,
        isFirstTimeCustomer: false,
        promoCode: 'SAVE15',
      });

      const promoDiscount = result.discounts.find(d =>
        d.name.includes('SAVE15')
      );
      expect(promoDiscount).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    const mockItems: BookingItem[] = [
      {
        id: '1',
        name: 'Heavy Item',
        category: 'furniture',
        volume: 0.5,
        weight: 100,
        quantity: 1,
        fragile: false,
        valuable: false,
      },
    ];

    const mockTimeSlot: EnhancedTimeSlot = {
      id: 'mock-time-slot',
      startTime: '14:00',
      endTime: '16:00',
      available: true,
      price: 0,
      popular: false,
      recommended: false,
      type: 'afternoon',
      multiplier: 1.0,
      demand: 'low',
    };

    const mockProperty: PricingPropertyDetails = {
      type: 'house',
      floor: 0,
      hasLift: false,
      narrowAccess: false,
    };

    test('handles zero distance', () => {
      const result = pricingEngine.calculatePricing({
        items: mockItems,
        serviceType: 'man-and-van',
        distance: 0,
        estimatedDuration: 2,
        timeSlot: mockTimeSlot,
        date: new Date('2024-06-15'),
        pickupProperty: mockProperty,
        dropoffProperty: mockProperty,
        isFirstTimeCustomer: false,
      });

      expect(result.total).toBeGreaterThan(0);
      expect(result.distancePrice).toBe(0);
    });

    test('handles minimum duration', () => {
      const result = pricingEngine.calculatePricing({
        items: mockItems,
        serviceType: 'man-and-van',
        distance: 5,
        estimatedDuration: 1,
        timeSlot: mockTimeSlot,
        date: new Date('2024-06-15'),
        pickupProperty: mockProperty,
        dropoffProperty: mockProperty,
        isFirstTimeCustomer: false,
      });

      expect(result.total).toBeGreaterThan(0);
    });

    test('handles empty items array', () => {
      expect(() => {
        pricingEngine.calculatePricing({
          items: [],
          serviceType: 'man-and-van',
          distance: 5,
          estimatedDuration: 2,
          timeSlot: mockTimeSlot,
          date: new Date('2024-06-15'),
          pickupProperty: mockProperty,
          dropoffProperty: mockProperty,
          isFirstTimeCustomer: false,
        });
      }).toThrow();
    });
  });
});
