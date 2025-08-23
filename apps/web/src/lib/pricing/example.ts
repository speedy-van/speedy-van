// src/lib/pricing/example.ts
// -----------------------------------------------------------------------------
// Example usage of the simplified pricing engine
// -----------------------------------------------------------------------------

import { computeQuote, type PricingInputs, type QuoteItem } from "./engine";

// ===== Example Scenarios =====================================================

function example1_CityMove() {
  console.log("\n=== Example 1: City Move (≤10 miles) ===");
  
  const input: PricingInputs = {
    miles: 8,
    items: [
      { key: "small", quantity: 5 },   // 5 small items
      { key: "medium", quantity: 3 },  // 3 medium items
      { key: "large", quantity: 1 }    // 1 large item
    ],
    workersTotal: 2,
    pickup: { floors: 2, hasLift: false },
    dropoff: { floors: 1, hasLift: true },
    vatRegistered: true
  };

  const result = computeQuote(input);
  
  console.log("Input:", JSON.stringify(input, null, 2));
  console.log("Result:", JSON.stringify(result, null, 2));
  
  // Expected: Base £40 + items ~£45 + workers £20 + stairs £10 + VAT = ~£138
}

function example2_RegionalMove() {
  console.log("\n=== Example 2: Regional Move (≤50 miles) ===");
  
  const input: PricingInputs = {
    miles: 35,
    items: [
      { key: "small", quantity: 10 },
      { key: "medium", quantity: 8 },
      { key: "large", quantity: 3 }
    ],
    workersTotal: 3,
    pickup: { floors: 3, hasLift: false },
    dropoff: { floors: 2, hasLift: false },
    extras: { ulezApplicable: true },
    vatRegistered: true
  };

  const result = computeQuote(input);
  
  console.log("Input:", JSON.stringify(input, null, 2));
  console.log("Result:", JSON.stringify(result, null, 2));
  
  // Expected: Base £60 + items ~£120 + workers £40 + stairs £30 + ULEZ £12.50 + VAT = ~£315
}

function example3_LongDistanceMove() {
  console.log("\n=== Example 3: Long Distance Move (>50 miles) ===");
  
  const input: PricingInputs = {
    miles: 120,
    items: [
      { key: "small", quantity: 15 },
      { key: "medium", quantity: 12 },
      { key: "large", quantity: 5 }
    ],
    workersTotal: 4,
    pickup: { floors: 1, hasLift: true },
    dropoff: { floors: 1, hasLift: true },
    vatRegistered: true
  };

  const result = computeQuote(input);
  
  console.log("Input:", JSON.stringify(input, null, 2));
  console.log("Result:", JSON.stringify(result, null, 2));
  
  // Expected: Base £60 + distance £84 + items ~£180 + workers £60 + VAT = ~£459
}

function example4_MinimalMove() {
  console.log("\n=== Example 4: Minimal Move (Testing Minimum) ===");
  
  const input: PricingInputs = {
    miles: 5,
    items: [
      { key: "small", quantity: 1 }
    ],
    workersTotal: 1,
    pickup: { floors: 1, hasLift: true },
    dropoff: { floors: 1, hasLift: true },
    vatRegistered: false
  };

  const result = computeQuote(input);
  
  console.log("Input:", JSON.stringify(input, null, 2));
  console.log("Result:", JSON.stringify(result, null, 2));
  
  // Expected: Base £40 + items ~£7.50 = £47.50, but minimum is £50
}

function example5_ComplexMove() {
  console.log("\n=== Example 5: Complex Move (All Factors) ===");
  
  const input: PricingInputs = {
    miles: 75,
    items: [
      { key: "small", quantity: 20 },
      { key: "medium", quantity: 15 },
      { key: "large", quantity: 8 }
    ],
    workersTotal: 5,
    pickup: { floors: 4, hasLift: false },
    dropoff: { floors: 3, hasLift: false },
    extras: { ulezApplicable: true },
    vatRegistered: true
  };

  const result = computeQuote(input);
  
  console.log("Input:", JSON.stringify(input, null, 2));
  console.log("Result:", JSON.stringify(result, null, 2));
  
  // Expected: Base £60 + distance £30 + items ~£300 + workers £80 + stairs £60 + ULEZ £12.50 + VAT = ~£654
}

// ===== Pricing Breakdown Examples ============================================

function showPricingBreakdown(result: any) {
  console.log("\n--- Pricing Breakdown ---");
  console.log(`Base Rate: £${result.breakdown.baseRate}`);
  console.log(`Distance Cost: £${result.breakdown.distanceCost}`);
  console.log(`Items Cost: £${result.breakdown.itemsCost}`);
  console.log(`Workers Cost: £${result.breakdown.workersCost}`);
  console.log(`Stairs Cost: £${result.breakdown.stairsCost}`);
  console.log(`Extras Cost: £${result.breakdown.extrasCost}`);
  console.log(`Subtotal: £${result.breakdown.subtotal}`);
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
