#!/usr/bin/env tsx

import { promises as fs } from 'fs';
import path from 'path';
import { SynonymIndexBuilder } from '../apps/web/src/lib/pricing/build-synonym-index';
import { CatalogItem } from '../apps/web/src/lib/pricing/types';

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

async function buildPricingData(): Promise<void> {
  try {
    console.log('🔨 Building pricing data files...');
    
    // Read the CSV file
    const csvPath = path.join(process.cwd(), 'apps/web/src/lib/pricing/data/catalog-dataset.csv');
    const csvContent = await fs.readFile(csvPath, 'utf-8');
    
    const lines = csvContent.trim().split('\n');
    const headers = parseCSVLine(lines[0]);
    const items: CatalogItem[] = [];
    
    console.log(`📊 Processing ${lines.length - 1} catalog items...`);
    
    // Parse each row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      const values = parseCSVLine(line);
      
      // Skip malformed rows
      if (values.length !== headers.length) {
        console.log(`⚠️  Skipping malformed row ${i + 1}: expected ${headers.length} columns, got ${values.length}`);
        continue;
      }
      
      try {
        const item: CatalogItem = {
          id: values[0],
          canonicalName: values[1],
          category: values[2],
          synonyms: values[3],
          volumeFactor: parseFloat(values[4]),
          requiresTwoPerson: values[5] === 'true',
          isFragile: values[6] === 'true',
          requiresDisassembly: values[7] === 'true',
          basePriceHint: parseInt(values[8])
        };
        
        items.push(item);
      } catch (error) {
        console.log(`⚠️  Skipping row ${i + 1}: ${error}`);
      }
    }
    
    console.log(`✅ Successfully parsed ${items.length} items`);
    
    // Build synonym index
    console.log('🔍 Building synonym index...');
    const builder = new SynonymIndexBuilder(items);
    const synonymIndex = builder.buildIndex();
    
    // Create compiled catalog data
    const compiledData = {
      items,
      metadata: {
        totalItems: items.length,
        categories: [...new Set(items.map(item => item.category))].sort(),
        lastUpdated: new Date().toISOString(),
        version: "2.0.0"
      }
    };
    
    // Write compiled catalog
    const compiledPath = path.join(process.cwd(), 'apps/web/src/lib/pricing/data/catalog-dataset.compiled.json');
    await fs.writeFile(compiledPath, JSON.stringify(compiledData, null, 2));
    console.log(`💾 Wrote compiled catalog to ${compiledPath}`);
    
    // Write synonym index
    const synonymPath = path.join(process.cwd(), 'apps/web/src/lib/pricing/data/synonym-index.json');
    await fs.writeFile(synonymPath, JSON.stringify(synonymIndex, null, 2));
    console.log(`💾 Wrote synonym index to ${synonymPath}`);
    
    // Print summary
    console.log('\n📈 BUILD SUMMARY:');
    console.log(`   Total items: ${items.length}`);
    console.log(`   Categories: ${compiledData.metadata.categories.length}`);
    console.log(`   Exact matches: ${Object.keys(synonymIndex.exactMap).length}`);
    console.log(`   Synonym tokens: ${Object.keys(synonymIndex.synonymsMap).length}`);
    
    console.log('\n✅ Pricing data build completed successfully!');
    
  } catch (error) {
    console.error('❌ Error building pricing data:', error);
    process.exit(1);
  }
}

// Run the build
buildPricingData();
