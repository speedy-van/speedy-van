// src/lib/pricing/example.ts
// -----------------------------------------------------------------------------
// Example usage of the simplified pricing engine
// -----------------------------------------------------------------------------

import { computeQuote, type PricingInputs } from "./engine";

// ===== Example Scenarios =====================================================

function example1_CityMove() {
  console.log("\n=== Example 1: City Move (≤10 miles) ===");
  
  const input: PricingInputs = {
    distanceMiles: 8,
    items: [
      { id: "small", canonicalName: "Small Item", quantity: 5, volumeFactor: 0.5, requiresTwoPerson: false, isFragile: false, requiresDisassembly: false, basePriceHint: 10 },
      { id: "medium", canonicalName: "Medium Item", quantity: 3, volumeFactor: 1.0, requiresTwoPerson: false, isFragile: false, requiresDisassembly: false, basePriceHint: 20 },
      { id: "large", canonicalName: "Large Item", quantity: 1, volumeFactor: 2.0, requiresTwoPerson: true, isFragile: false, requiresDisassembly: false, basePriceHint: 40 }
    ],
    pickupFloors: 2,
    pickupHasLift: false,
    dropoffFloors: 1,
    dropoffHasLift: true,
    helpersCount: 2,
    extras: { ulez: false, vat: true }
  };

  const result = computeQuote(input);
  
  console.log("Input:", JSON.stringify(input, null, 2));
  console.log("Result:", JSON.stringify(result, null, 2));
  
  // Expected: Base £40 + items ~£45 + workers £20 + stairs £10 + VAT = ~£138
}

function example2_RegionalMove() {
  console.log("\n=== Example 2: Regional Move (≤50 miles) ===");
  
  const input: PricingInputs = {
    distanceMiles: 35,
    items: [
      { id: "small", canonicalName: "Small Item", quantity: 10, volumeFactor: 0.5, requiresTwoPerson: false, isFragile: false, requiresDisassembly: false, basePriceHint: 10 },
      { id: "medium", canonicalName: "Medium Item", quantity: 8, volumeFactor: 1.0, requiresTwoPerson: false, isFragile: false, requiresDisassembly: false, basePriceHint: 20 },
      { id: "large", canonicalName: "Large Item", quantity: 3, volumeFactor: 2.0, requiresTwoPerson: true, isFragile: false, requiresDisassembly: false, basePriceHint: 40 }
    ],
    pickupFloors: 3,
    pickupHasLift: false,
    dropoffFloors: 2,
    dropoffHasLift: false,
    helpersCount: 3,
    extras: { ulez: true, vat: true }
  };

  const result = computeQuote(input);
  
  console.log("Input:", JSON.stringify(input, null, 2));
  console.log("Result:", JSON.stringify(result, null, 2));
  
  // Expected: Base £60 + items ~£120 + workers £40 + stairs £30 + ULEZ £12.50 + VAT = ~£315
}

function example3_LongDistanceMove() {
  console.log("\n=== Example 3: Long Distance Move (>50 miles) ===");
  
  const input: PricingInputs = {
    distanceMiles: 120,
    items: [
      { id: "small", canonicalName: "Small Item", quantity: 15, volumeFactor: 0.5, requiresTwoPerson: false, isFragile: false, requiresDisassembly: false, basePriceHint: 10 },
      { id: "medium", canonicalName: "Medium Item", quantity: 12, volumeFactor: 1.0, requiresTwoPerson: false, isFragile: false, requiresDisassembly: false, basePriceHint: 20 },
      { id: "large", canonicalName: "Large Item", quantity: 5, volumeFactor: 2.0, requiresTwoPerson: true, isFragile: false, requiresDisassembly: false, basePriceHint: 40 }
    ],
    pickupFloors: 1,
    pickupHasLift: true,
    dropoffFloors: 1,
    dropoffHasLift: true,
    helpersCount: 4,
    extras: { ulez: false, vat: true }
  };

  const result = computeQuote(input);
  
  console.log("Input:", JSON.stringify(input, null, 2));
  console.log("Result:", JSON.stringify(result, null, 2));
  
  // Expected: Base £60 + distance £84 + items ~£180 + workers £60 + VAT = ~£459
}

function example4_MinimalMove() {
  console.log("\n=== Example 4: Minimal Move (Testing Minimum) ===");
  
  const input: PricingInputs = {
    distanceMiles: 5,
    items: [
      { id: "small", canonicalName: "Small Item", quantity: 1, volumeFactor: 0.5, requiresTwoPerson: false, isFragile: false, requiresDisassembly: false, basePriceHint: 10 }
    ],
    pickupFloors: 1,
    pickupHasLift: true,
    dropoffFloors: 1,
    dropoffHasLift: true,
    helpersCount: 1,
    extras: { ulez: false, vat: false }
  };

  const result = computeQuote(input);
  
  console.log("Input:", JSON.stringify(input, null, 2));
  console.log("Result:", JSON.stringify(result, null, 2));
  
  // Expected: Base £40 + items ~£7.50 = £47.50, but minimum is £50
}

function example5_ComplexMove() {
  console.log("\n=== Example 5: Complex Move (All Factors) ===");
  
  const input: PricingInputs = {
    distanceMiles: 75,
    items: [
      { id: "small", canonicalName: "Small Item", quantity: 20, volumeFactor: 0.5, requiresTwoPerson: false, isFragile: false, requiresDisassembly: false, basePriceHint: 10 },
      { id: "medium", canonicalName: "Medium Item", quantity: 15, volumeFactor: 1.0, requiresTwoPerson: false, isFragile: false, requiresDisassembly: false, basePriceHint: 20 },
      { id: "large", canonicalName: "Large Item", quantity: 8, volumeFactor: 2.0, requiresTwoPerson: true, isFragile: false, requiresDisassembly: false, basePriceHint: 40 }
    ],
    pickupFloors: 4,
    pickupHasLift: false,
    dropoffFloors: 3,
    dropoffHasLift: false,
    helpersCount: 5,
    extras: { ulez: true, vat: true }
  };

  const result = computeQuote(input);
  
  console.log("Input:", JSON.stringify(input, null, 2));
  console.log("Result:", JSON.stringify(result, null, 2));
  
  // Expected: Base £60 + distance £30 + items ~£300 + workers £80 + stairs £60 + ULEZ £12.50 + VAT = ~£654
}

// ===== Pricing Breakdown Examples ============================================

function showPricingBreakdown(result: any) {
  console.log("\n--- Pricing Breakdown ---");
  console.log(`Distance Base: £${result.breakdown.distanceBase}`);
  console.log(`Total Volume Factor: ${result.breakdown.totalVolumeFactor}`);
  console.log(`Floors Cost: £${result.breakdown.floorsCost}`);
  console.log(`Helpers Cost: £${result.breakdown.helpersCost}`);
  console.log(`Extras Cost: £${result.breakdown.extrasCost}`);
  console.log(`VAT: £${result.breakdown.vat}`);
  console.log(`Total: £${result.breakdown.total}`);
}

// ===== Run All Examples =====================================================

export function runAllExamples() {
  console.log("🚚 Speedy Van - Simplified Pricing Examples");
  console.log("=" .repeat(50));
  
  example1_CityMove();
  example2_RegionalMove();
  example3_LongDistanceMove();
  example4_MinimalMove();
  example5_ComplexMove();
  
  console.log("\n" + "=" .repeat(50));
  console.log("✅ All examples completed!");
}

// ===== Individual Test Functions ============================================

export function testCityMove() {
  console.log("Testing City Move...");
  example1_CityMove();
}

export function testRegionalMove() {
  console.log("Testing Regional Move...");
  example2_RegionalMove();
}

export function testLongDistanceMove() {
  console.log("Testing Long Distance Move...");
  example3_LongDistanceMove();
}

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples();
}
