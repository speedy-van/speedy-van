import {
  UnifiedPricingRequest,
  UnifiedPricingResult,
  EnterprisePricingResult,
  unifiedPricingFacade,
} from '@/lib/pricing/unified-pricing-facade';

export interface EnterprisePricingOptions {
  customerType: 'individual' | 'business' | 'enterprise';
  volumeDiscount: boolean;
  priorityLevel: 'standard' | 'high' | 'urgent';
  serviceLevel: 'basic' | 'premium' | 'enterprise';
  insuranceLevel: 'basic' | 'standard' | 'premium';
}


export class EnterprisePricingService {
  private static instance: EnterprisePricingService;

  static getInstance(): EnterprisePricingService {
    if (!EnterprisePricingService.instance) {
      EnterprisePricingService.instance = new EnterprisePricingService();
    }
    return EnterprisePricingService.instance;
  }

  async calculateEnterprisePrice(
    request: UnifiedPricingRequest,
    options: EnterprisePricingOptions
  ): Promise<EnterprisePricingResult> {
    try {
      // Get base pricing
      const baseResult = await unifiedPricingFacade.calculatePricing(request);
      
      // Apply enterprise pricing logic
      let finalPrice = baseResult.totalPrice;
      let volumeDiscount = 0;
      let serviceMultiplier = 1.0;

      // Volume discount for business/enterprise customers
      if (options.volumeDiscount && options.customerType !== 'individual') {
        volumeDiscount = this.calculateVolumeDiscount(finalPrice, options.customerType);
        finalPrice -= volumeDiscount;
      }

      // Priority level multiplier
      switch (options.priorityLevel) {
        case 'urgent':
          serviceMultiplier = 2.5;
          break;
        case 'high':
          serviceMultiplier = 1.8;
          break;
        default:
          serviceMultiplier = 1.0;
      }

      // Service level multiplier
      switch (options.serviceLevel) {
        case 'enterprise':
          serviceMultiplier *= 1.5;
          break;
        case 'premium':
          serviceMultiplier *= 1.3;
          break;
        default:
          serviceMultiplier *= 1.0;
      }

      finalPrice *= serviceMultiplier;

      // Ensure minimum price
      finalPrice = Math.max(25, finalPrice);

      // Return enhanced result
      return {
        ...baseResult,
        price: finalPrice,
        totalPrice: finalPrice,
        enterpriseFeatures: {
          dedicatedSupport: options.serviceLevel === 'enterprise',
          priorityScheduling: options.priorityLevel === 'high' || options.priorityLevel === 'urgent',
          insuranceCoverage: options.insuranceLevel,
          volumeDiscount: volumeDiscount,
          serviceLevel: options.serviceLevel,
        },
      };
    } catch (error) {
      console.error('Enterprise pricing calculation failed:', error);
      // Return a minimal valid result
      return {
        price: 0,
        currency: 'GBP',
        totalPrice: 0,
        subtotalBeforeVAT: 0,
        vatAmount: 0,
        vatRate: 0.2,
        basePrice: 0,
        itemsPrice: 0,
        servicePrice: 0,
        propertyAccessPrice: 0,
        urgencyPrice: 0,
        promoDiscount: 0,
        estimatedDuration: 0,
        recommendedVehicle: 'van',
        distance: 0,
        breakdown: {},
        surcharges: [],
        multipliers: {},
        recommendations: [],
        optimizationTips: [],
        requestId: 'error',
        calculatedAt: new Date().toISOString(),
        version: '1.0.0',
      };
    }
  }

  private calculateVolumeDiscount(basePrice: number, customerType: string): number {
    if (customerType === 'enterprise') {
      return basePrice * 0.15; // 15% discount
    } else if (customerType === 'business') {
      return basePrice * 0.10; // 10% discount
    }
    return 0;
  }

  private getInsuranceCoverage(level: string): string {
    switch (level) {
      case 'premium':
        return 'Full coverage up to £50,000';
      case 'standard':
        return 'Standard coverage up to £10,000';
      default:
        return 'Basic coverage up to £2,500';
    }
  }

  async getEnterpriseFeatures(customerType: string): Promise<{
    features: string[];
    benefits: string[];
    requirements: string[];
  }> {
    switch (customerType) {
      case 'enterprise':
        return {
          features: [
            'Dedicated account manager',
            'Priority scheduling',
            '24/7 support',
            'Custom pricing',
            'Volume discounts',
            'Premium insurance',
          ],
          benefits: [
            'Faster response times',
            'Custom service levels',
            'Dedicated support team',
            'Flexible scheduling',
            'Cost savings',
          ],
          requirements: [
            'Minimum 100 orders per month',
            'Annual contract',
            'Business registration',
          ],
        };
      case 'business':
        return {
          features: [
            'Priority support',
            'Flexible scheduling',
            'Volume discounts',
            'Standard insurance',
          ],
          benefits: [
            'Better response times',
            'Cost savings',
            'Flexible terms',
          ],
          requirements: [
            'Minimum 20 orders per month',
            'Business registration',
          ],
        };
      default:
        return {
          features: [
            'Standard support',
            'Regular scheduling',
            'Basic insurance',
          ],
          benefits: [
            'Reliable service',
            'Competitive pricing',
          ],
          requirements: [
            'Valid contact information',
          ],
        };
    }
  }
}

export const enterprisePricingService = EnterprisePricingService.getInstance();