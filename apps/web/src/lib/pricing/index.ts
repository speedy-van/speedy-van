/**
 * Unified Pricing System - Single Export Point
 * 
 * This is the ONLY allowed entry point for pricing functionality.
 * All pricing calculations MUST go through UnifiedPricingFacade.
 * 
 * @deprecated Legacy pricing engines are disabled
 * @see UnifiedPricingFacade for all pricing needs
 */

// ONLY ALLOWED PRICING IMPORT
export { 
  unifiedPricingFacade,
  UnifiedPricingFacade,
  type UnifiedPricingRequest,
  type UnifiedPricingResult,
} from './unified-pricing-facade';

// Hooks for automatic pricing
export {
  useUnifiedPricing,
  useAutomaticPricing,
} from '../hooks/use-unified-pricing';

// Display-only components (no actual calculations)
export {
  DisplayOnlyPricing,
  ServicePricingComparison,
  InlinePricingDisplay,
  HeroPricingBanner,
} from '../../components/pricing/DisplayOnlyPricing';

// DEPRECATED EXPORTS - DO NOT USE
// These are kept for backward compatibility only and will be removed

/**
 * @deprecated Use unifiedPricingFacade instead
 * @throws Error when used
 */
export const deprecatedPricingCalculator = {
  calculate: () => {
    throw new Error('❌ DEPRECATED: Use unifiedPricingFacade.calculatePricing() instead');
  }
};

/**
 * @deprecated Distance calculations are disabled
 * @throws Error when used
 */
export const deprecatedDistanceCalculator = {
  calculateDistance: () => {
    throw new Error('❌ DEPRECATED: Distance calculations are disabled. Use UnifiedPricingFacade instead.');
  }
};

// Constants for validation
export const PRICING_SYSTEM_VERSION = '4.0-Unified-Enterprise';
export const ALLOWED_PRICING_ENGINES = ['UnifiedPricingFacade'] as const;
export const DEPRECATED_PRICING_ENGINES = [
  'PricingCalculator',
  'DistanceCalculator'
] as const;

// Validation function
export function validatePricingSystemUsage(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // This would be implemented to scan the codebase for deprecated usage
  // For now, it's a placeholder for future static analysis

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Migration helpers
export const MIGRATION_GUIDE = {
  from: {
    'PricingCalculator': 'Use unifiedPricingFacade.calculatePricing() instead',
    'calculateDistance': 'Distance calculations are removed - not needed in unified system',
    '/api/pricing/calculate': 'Use /api/pricing/quote instead',
  },
  examples: {
    oldWay: `
      // ❌ OLD WAY - Don't use
      import { PricingCalculator } from '@speedy-van/pricing';
      const calculator = new PricingCalculator();
      const result = await calculator.calculate(request);
    `,
    newWay: `
      // ✅ NEW WAY - Use this
      import { unifiedPricingFacade } from '@/lib/pricing';
      const result = await unifiedPricingFacade.calculatePricing(request);
    `,
  },
} as const;

// Log usage for monitoring
console.log(`📊 Pricing System: ${PRICING_SYSTEM_VERSION} loaded`);
console.log(`✅ Allowed engines: ${ALLOWED_PRICING_ENGINES.join(', ')}`);
console.log(`❌ Deprecated engines: ${DEPRECATED_PRICING_ENGINES.join(', ')}`);
