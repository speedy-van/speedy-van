/**
 * Unified pricing facade for Speedy Van
 */

export interface UnifiedPricingRequest {
  pickupCoordinates: { lat: number; lng: number };
  dropoffCoordinates: { lat: number; lng: number };
  distanceKm: number;
  durationMinutes: number;
  vehicleType: string;
  serviceType: string;
  scheduledTime: string; // ISO string
  items?: Array<{
    name: string;
    quantity: number;
    weight?: number;
    fragile?: boolean;
  }>;
}

export interface UnifiedPricingResult {
  // Core pricing
  price: number;
  currency: string;
  totalPrice: number;
  subtotalBeforeVAT: number;
  vatAmount: number;
  vatRate: number;
  
  // Pricing breakdown
  basePrice: number;
  itemsPrice: number;
  servicePrice: number;
  propertyAccessPrice: number;
  urgencyPrice: number;
  promoDiscount: number;
  
  // Metadata
  estimatedDuration: number;
  recommendedVehicle: string;
  distance: number;
  
  // Detailed information
  breakdown: Record<string, number>;
  surcharges: Array<{ category: string; amount: number; reason: string }>;
  multipliers: Record<string, number>;
  recommendations: string[];
  optimizationTips: string[];
  
  // Request tracking
  requestId?: string;
  calculatedAt: string;
  version: string;
}

export interface EnterprisePricingResult extends UnifiedPricingResult {
  enterpriseFeatures?: {
    dedicatedSupport: boolean;
    priorityScheduling: boolean;
    insuranceCoverage: string;
    volumeDiscount: number;
    serviceLevel: string;
  };
}

export class UnifiedPricingFacade {
  private static instance: UnifiedPricingFacade;

  static getInstance(): UnifiedPricingFacade {
    if (!UnifiedPricingFacade.instance) {
      UnifiedPricingFacade.instance = new UnifiedPricingFacade();
    }
    return UnifiedPricingFacade.instance;
  }

  async calculatePricing(request: UnifiedPricingRequest): Promise<UnifiedPricingResult> {
    // Base pricing logic
    const baseRate = 25; // Base rate in GBP
    const distanceRate = 1.5; // Per km
    const timeRate = 0.5; // Per minute
    const itemRate = 2; // Per item
    const serviceFee = 5; // Service fee
    const taxRate = 0.2; // 20% VAT

    const distance = request.distanceKm;
    const duration = request.durationMinutes;
    const itemCount = request.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    const basePrice = baseRate;
    const distancePrice = distance * distanceRate;
    const timePrice = duration * timeRate;
    const itemPrice = itemCount * itemRate;

    const subtotal = basePrice + distancePrice + timePrice + itemPrice + serviceFee;
    const taxes = subtotal * taxRate;
    const totalPrice = subtotal + taxes;

    return {
      // Core pricing
      price: totalPrice,
      currency: 'GBP',
      totalPrice: totalPrice,
      subtotalBeforeVAT: subtotal,
      vatAmount: taxes,
      vatRate: taxRate,
      
      // Pricing breakdown
      basePrice: basePrice,
      itemsPrice: itemPrice,
      servicePrice: serviceFee,
      propertyAccessPrice: 0,
      urgencyPrice: 0,
      promoDiscount: 0,
      
      // Metadata
      estimatedDuration: duration,
      recommendedVehicle: 'van',
      distance: distance,
      
      // Detailed information
      breakdown: {
        base: basePrice,
        distance: distancePrice,
        time: timePrice,
        items: itemPrice,
        service: serviceFee,
        taxes: taxes,
      },
      surcharges: [],
      multipliers: {},
      recommendations: [],
      optimizationTips: [],
      
      // Request tracking
      requestId: `req_${Date.now()}`,
      calculatedAt: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  async calculateEnterprisePricing(request: UnifiedPricingRequest): Promise<EnterprisePricingResult> {
    try {
      const standardResult = await this.calculatePricing(request);
      
      if (!standardResult) {
        throw new Error('Standard pricing calculation failed');
      }
      
      // Enterprise pricing might have different rates or additional services
      const enterpriseMultiplier = 1.2; // 20% premium for enterprise
      
      return {
        ...standardResult,
        price: standardResult.price * enterpriseMultiplier,
        totalPrice: standardResult.totalPrice * enterpriseMultiplier,
        breakdown: {
          ...standardResult.breakdown,
          enterpriseMultiplier,
        },
        enterpriseFeatures: {
          dedicatedSupport: true,
          priorityScheduling: true,
          insuranceCoverage: 'comprehensive',
          volumeDiscount: standardResult.price * 0.15,
          serviceLevel: 'premium',
        },
      };
    } catch (error) {
      console.error('❌ Enterprise pricing calculation failed:', error);
      // Return fallback pricing
      return {
        price: 50,
        currency: 'GBP',
        totalPrice: 50,
        subtotalBeforeVAT: 41.67,
        vatAmount: 8.33,
        vatRate: 0.2,
        basePrice: 25,
        itemsPrice: 10,
        servicePrice: 10,
        propertyAccessPrice: 0,
        urgencyPrice: 0,
        promoDiscount: 0,
        estimatedDuration: 90,
        recommendedVehicle: 'van',
        distance: request.distanceKm,
        breakdown: {
          base: 25,
          distance: 0,
          time: 0,
          items: 10,
          service: 10,
          taxes: 8.33,
        },
        surcharges: [],
        multipliers: {},
        recommendations: [],
        optimizationTips: [],
        requestId: 'fallback',
        // timestamp removed - not in interface
        enterpriseFeatures: {
          dedicatedSupport: true,
          priorityScheduling: true,
          insuranceCoverage: 'comprehensive',
          volumeDiscount: 0,
          serviceLevel: 'premium',
        },
        calculatedAt: new Date().toISOString(),
        version: '1.0.0',
      };
    }
  }

  validatePricingResult(result: UnifiedPricingResult): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!result.totalPrice || result.totalPrice <= 0) {
      errors.push('Invalid total price');
    }
    
    if (!result.currency) {
      errors.push('Missing currency');
    }
    
    if (result.vatRate < 0 || result.vatRate > 1) {
      errors.push('Invalid VAT rate');
    }
    
    if (!result.requestId) {
      errors.push('Missing request ID');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const unifiedPricingFacade = UnifiedPricingFacade.getInstance();
export default unifiedPricingFacade;