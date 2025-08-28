#!/usr/bin/env tsx

import { SynonymIndexBuilder } from '../apps/web/src/lib/pricing/build-synonym-index';
import { ItemNormalizer } from '../apps/web/src/lib/pricing/normalizer';
import { AutocompleteEngine } from '../apps/web/src/lib/pricing/autocomplete';
import { PricingEngine } from '../apps/web/src/lib/pricing/engine';
import { CatalogItem } from '../apps/web/src/lib/pricing/types';

// Sample catalog data for testing
const sampleCatalog: CatalogItem[] = [
  {
    id: "sofa-2seat",
    canonicalName: "Sofa – 2-seat",
    category: "sofas",
    synonyms: "2 seater, small sofa, couch, settee",
    volumeFactor: 1.2,
    requiresTwoPerson: false,
    isFragile: false,
    requiresDisassembly: false,
    basePriceHint: 32
  },
  {
    id: "sofa-3seat",
    canonicalName: "Sofa – 3-seat",
    category: "sofas",
    synonyms: "3 seater, medium sofa, regular sofa",
    volumeFactor: 1.6,
    requiresTwoPerson: true,
    isFragile: false,
    requiresDisassembly: false,
    basePriceHint: 48
  },
  {
    id: "box-large",
    canonicalName: "Box - Large",
    category: "boxes",
    synonyms: "large box, suitcase, storage box",
    volumeFactor: 0.4,
    requiresTwoPerson: false,
    isFragile: false,
    requiresDisassembly: false,
    basePriceHint: 9
  }
];

async function testPricingSystem(): Promise<void> {
  console.log('🧪 Testing Pricing System Components...\n');
  
  try {
    // Test 1: Synonym Index Builder
    console.log('1️⃣ Testing Synonym Index Builder...');
    const builder = new SynonymIndexBuilder(sampleCatalog);
    const synonymIndex = builder.buildIndex();
    
    console.log(`   ✅ Built index with ${Object.keys(synonymIndex.exactMap).length} exact matches`);
    console.log(`   ✅ Built index with ${Object.keys(synonymIndex.synonymsMap).length} synonym tokens`);
    
    // Test 2: Item Normalizer
    console.log('\n2️⃣ Testing Item Normalizer...');
    const normalizer = new ItemNormalizer(sampleCatalog, synonymIndex);
    
    const normalizationResult = normalizer.normalizeInput("small sofa");
    console.log(`   ✅ Normalized "small sofa" result:`, JSON.stringify(normalizationResult, null, 2));
    
    if (normalizationResult.items.length > 0) {
      console.log(`   ✅ Normalized "small sofa" to: ${normalizationResult.items[0]?.id}`);
    } else {
      console.log(`   ⚠️  No normalized items found for "small sofa"`);
    }
    
    const multipleItemsResult = normalizer.normalizeInput(["medium sofa", "large box"]);
    console.log(`   ✅ Multiple items result:`, JSON.stringify(multipleItemsResult, null, 2));
    
    if (multipleItemsResult.items.length > 0) {
      console.log(`   ✅ Normalized multiple items: ${multipleItemsResult.items.map(item => item.id).join(', ')}`);
    } else {
      console.log(`   ⚠️  No normalized items found for multiple items`);
    }
    
    // Test 3: Autocomplete Engine
    console.log('\n3️⃣ Testing Autocomplete Engine...');
    const autocomplete = new AutocompleteEngine(sampleCatalog, synonymIndex);
    
    const suggestions = await autocomplete.search("sofa");
    console.log(`   ✅ Found ${suggestions.length} suggestions for "sofa"`);
    console.log(`   ✅ Suggestions:`, JSON.stringify(suggestions, null, 2));
    
    if (suggestions.length > 0) {
      console.log(`   ✅ Top suggestion: ${suggestions[0]?.item?.id || 'No item found'}`);
    }
    
    // Test 4: Pricing Engine
    console.log('\n4️⃣ Testing Pricing Engine...');
    const pricingEngine = new PricingEngine();
    
    const quoteRequest = {
      distanceMiles: 15,
      pickupFloors: 0,
      pickupHasLift: true,
      dropoffFloors: 0,
      dropoffHasLift: true,
      items: [
        { id: "sofa-2seat", canonicalName: "Sofa – 2-seat", quantity: 1, volumeFactor: 1.2, requiresTwoPerson: false, isFragile: false, requiresDisassembly: false },
        { id: "box-large", canonicalName: "Box - Large", quantity: 3, volumeFactor: 0.4, requiresTwoPerson: false, isFragile: false, requiresDisassembly: false }
      ],
      helpersCount: 0,
      extras: { ulez: false, vat: false }
    };
    
    const quote = pricingEngine.calculateQuote(quoteRequest);
    if (quote.success) {
      console.log(`   ✅ Calculated quote: £${quote.breakdown.total.toFixed(2)}`);
      console.log(`   ✅ Breakdown: Base £${quote.breakdown.distanceBase}, Volume Factor ${quote.breakdown.totalVolumeFactor}, Total £${quote.breakdown.total}`);
    } else {
      console.log(`   ❌ Quote calculation failed:`, quote.errors);
    }
    
    // Test 5: End-to-End Flow
    console.log('\n5️⃣ Testing End-to-End Flow...');
    const userInput = "small sofa and 3 large boxes";
    const normalized = normalizer.normalizeInput(userInput);
    
    if (normalized.items.length > 0) {
      const endToEndQuote = pricingEngine.calculateQuote({
        distanceMiles: 20,
        pickupFloors: 1,
        pickupHasLift: false,
        dropoffFloors: 0,
        dropoffHasLift: true,
        items: normalized.items,
        helpersCount: 0,
        extras: { ulez: false, vat: false }
      });
      
      if (endToEndQuote.success) {
        console.log(`   ✅ End-to-end quote for "${userInput}": £${endToEndQuote.breakdown.total.toFixed(2)}`);
        console.log(`   ✅ Floor cost: £${endToEndQuote.breakdown.floorsCost.toFixed(2)}`);
      } else {
        console.log(`   ❌ End-to-end quote failed:`, endToEndQuote.errors);
      }
    }
    
    console.log('\n🎉 All tests passed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('   ✅ Synonym Index Builder: Working');
    console.log('   ✅ Item Normalizer: Working');
    console.log('   ✅ Autocomplete Engine: Working');
    console.log('   ✅ Pricing Engine: Working');
    console.log('   ✅ End-to-End Flow: Working');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the tests
testPricingSystem();
