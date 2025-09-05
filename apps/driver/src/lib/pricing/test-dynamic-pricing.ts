import { computeQuote, type PricingInputs } from './engine';
import { getCurrentPricingSettings } from './settings';

// Test data
const testInput: PricingInputs = {
  distanceMiles: 15,
  items: [
    {
      id: 'small-box',
      canonicalName: 'Small Box',
      quantity: 2,
      volumeFactor: 0.2,
      requiresTwoPerson: false,
      isFragile: false,
      requiresDisassembly: false,
      basePriceHint: 4,
    },
    {
      id: 'medium-box',
      canonicalName: 'Medium Box',
      quantity: 1,
      volumeFactor: 0.2,
      requiresTwoPerson: false,
      isFragile: false,
      requiresDisassembly: false,
      basePriceHint: 4,
    },
  ],
  pickupFloors: 2,
  pickupHasLift: false,
  dropoffFloors: 1,
  dropoffHasLift: true,
  helpersCount: 2,
  extras: { ulez: true, vat: true },
};

async function testDynamicPricing() {
  console.log('=== Testing Dynamic Pricing ===');

  // Test 1: Get current settings
  console.log('\n1. Current Pricing Settings:');
  const settings = await getCurrentPricingSettings();
  console.log('Settings:', settings);

  // Test 2: Calculate quote with current settings
  console.log('\n2. Quote with current settings:');
  const result = await computeQuote(testInput);
  console.log('Total:', result.breakdown.total);
  console.log('Breakdown:', result.breakdown);

  // Test 3: Show what the quote would be without adjustments
  console.log('\n3. Quote breakdown:');
  console.log('Distance Base:', result.breakdown.distanceBase);
  console.log('Total Volume Factor:', result.breakdown.totalVolumeFactor);
  console.log('Floors Cost:', result.breakdown.floorsCost);
  console.log('Helpers Cost:', result.breakdown.helpersCost);
  console.log('Extras Cost:', result.breakdown.extrasCost);
  console.log('VAT:', result.breakdown.vat);
  console.log('Total:', result.breakdown.total);

  return result;
}

// Run the test
testDynamicPricing().catch(console.error);
