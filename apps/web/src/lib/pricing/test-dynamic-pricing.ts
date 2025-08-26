import { computeQuote, type PricingInputs } from './engine';
import { getCurrentPricingSettings } from './settings';

// Test data
const testInput: PricingInputs = {
  miles: 15,
  items: [
    { key: 'small-box', quantity: 2 },
    { key: 'medium-box', quantity: 1 }
  ],
  workersTotal: 2,
  pickup: { floors: 2, hasLift: false },
  dropoff: { floors: 1, hasLift: true },
  extras: { ulezApplicable: true },
  vatRegistered: true
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
  console.log('Total:', result.totalGBP);
  console.log('Breakdown:', result.breakdown);
  console.log('Price Adjustment Applied:', result.breakdown.priceAdjustment);
  
  // Test 3: Show what the quote would be without adjustments
  console.log('\n3. Quote breakdown:');
  console.log('Base Rate:', result.breakdown.baseRate);
  console.log('Distance Cost:', result.breakdown.distanceCost);
  console.log('Items Cost:', result.breakdown.itemsCost);
  console.log('Workers Cost:', result.breakdown.workersCost);
  console.log('Stairs Cost:', result.breakdown.stairsCost);
  console.log('Extras Cost:', result.breakdown.extrasCost);
  console.log('Subtotal (after adjustment):', result.breakdown.subtotal);
  console.log('VAT:', result.breakdown.vat);
  console.log('Total:', result.breakdown.total);
  
  return result;
}

// Run the test
testDynamicPricing().catch(console.error);
