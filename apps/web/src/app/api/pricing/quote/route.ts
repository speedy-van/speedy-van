// src/app/api/pricing/quote/route.ts
// -----------------------------------------------------------------------------
// Enhanced pricing API that handles both raw text input and normalized items.
// Returns pricing with item normalization and detailed breakdown.
// -----------------------------------------------------------------------------

import { NextRequest, NextResponse } from 'next/server';
import { PricingEngine } from '@/lib/pricing/engine';
import { ItemNormalizer } from '@/lib/pricing/normalizer';
import { promises as fs } from 'fs';
import path from 'path';
import { CatalogItem, NormalizedItem } from '@/lib/pricing/types';

// Simple CSV parser that handles quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      distanceMiles,
      rawItems,
      pickupFloors = 0,
      pickupHasLift = false,
      dropoffFloors = 0,
      dropoffHasLift = false,
      helpersCount = 0,
      extras = { ulez: false, vat: false }
    } = body;

    // Validate required fields
    if (typeof distanceMiles !== 'number' || distanceMiles < 0) {
      return NextResponse.json(
        { error: 'Invalid distance' },
        { status: 400 }
      );
    }

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json(
        { error: 'At least one item is required' },
        { status: 400 }
      );
    }

    // Load catalog data from compiled JSON for better performance
    const compiledPath = path.join(process.cwd(), 'src/lib/pricing/data/catalog-dataset.compiled.json');
    const compiledContent = await fs.readFile(compiledPath, 'utf-8');
    const compiledData = JSON.parse(compiledContent);
    const catalogItems: CatalogItem[] = compiledData.items;

    // Build synonym index
    const { SynonymIndexBuilder } = await import('@/lib/pricing/build-synonym-index');
    const builder = new SynonymIndexBuilder(catalogItems);
    const synonymIndex = builder.buildIndex();

    // Normalize items
    const normalizer = new ItemNormalizer(catalogItems, synonymIndex);
    const normalizationResult = normalizer.normalizeInput(rawItems);

    if (!normalizationResult.success) {
      return NextResponse.json(
        {
          error: 'Failed to normalize some items',
          unrecognized: normalizationResult.unrecognized,
          suggestions: normalizationResult.suggestions
        },
        { status: 400 }
      );
    }

    // Validate normalized items
    const validationErrors = normalizer.validateItems(normalizationResult.items);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: 'Item validation failed',
          details: validationErrors
        },
        { status: 400 }
      );
    }

    // Calculate quote
    const pricingEngine = new PricingEngine();
    const pricingRequest = {
      distanceMiles,
      items: normalizationResult.items,
      pickupFloors,
      pickupHasLift,
      dropoffFloors,
      dropoffHasLift,
      helpersCount,
      extras
    };

    const pricingResponse = pricingEngine.calculateQuote(pricingRequest);

    if (!pricingResponse.success) {
      return NextResponse.json(
        {
          error: 'Pricing calculation failed',
          details: pricingResponse.errors
        },
        { status: 400 }
      );
    }

    // Return successful response
    return NextResponse.json({
      success: true,
      breakdown: pricingResponse.breakdown,
      normalizedItems: normalizationResult.items,
      requiresHelpers: pricingResponse.requiresHelpers,
      suggestions: pricingResponse.suggestions,
      metadata: {
        totalItems: normalizationResult.items.length,
        totalVolume: pricingResponse.breakdown.totalVolumeFactor,
        distanceMiles,
        calculatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error calculating quote:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
