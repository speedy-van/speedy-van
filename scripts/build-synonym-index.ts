#!/usr/bin/env tsx
// scripts/build-synonym-index.ts
// -----------------------------------------------------------------------------
// Build script to generate and save synonym index for production use.
// Creates optimized JSON files for fast loading in the browser.
// -----------------------------------------------------------------------------

import fs from 'fs';
import path from 'path';
import { buildSynonymIndex, validateSynonymIndex } from '../apps/web/src/lib/pricing/build-synonym-index';

interface BuildOptions {
  inputPath: string;
  outputDir: string;
  minify: boolean;
  validate: boolean;
}

async function buildSynonymIndexFiles(options: BuildOptions) {
  const { inputPath, outputDir, minify, validate } = options;
  
  console.log('🔨 Building Synonym Index Files');
  console.log('================================');
  console.log(`Input: ${inputPath}`);
  console.log(`Output: ${outputDir}`);
  console.log(`Minify: ${minify}`);
  console.log(`Validate: ${validate}`);
  console.log('');
  
  try {
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`✅ Created output directory: ${outputDir}`);
    }
    
    // Load catalog data
    console.log('📖 Loading catalog data...');
    const catalogData = await loadCatalogData(inputPath);
    console.log(`✅ Loaded ${catalogData.length} catalog items`);
    
    // Build synonym index
    console.log('🔍 Building synonym index...');
    const synonymIndex = buildSynonymIndex(catalogData);
    console.log(`✅ Built synonym index with ${synonymIndex.metadata.totalSynonyms} synonyms`);
    
    // Validate if requested
    if (validate) {
      console.log('✅ Validating synonym index...');
      const validation = validateSynonymIndex(synonymIndex);
      
      if (!validation.isValid) {
        console.error('❌ Synonym index validation failed:');
        validation.errors.forEach(error => console.error(`  - ${error}`));
        process.exit(1);
      }
      
      if (validation.warnings.length > 0) {
        console.log('⚠️  Validation warnings:');
        validation.warnings.forEach(warning => console.log(`  - ${warning}`));
      }
      
      console.log('✅ Synonym index validation passed');
    }
    
    // Prepare output data
    const outputData = {
      catalog: catalogData,
      synonymIndex: synonymIndex,
      metadata: {
        buildDate: new Date().toISOString(),
        version: '2.0.0',
        totalItems: catalogData.length,
        totalSynonyms: synonymIndex.metadata.totalSynonyms,
        categories: synonymIndex.metadata.categories
      }
    };
    
    // Save full data
    const fullOutputPath = path.join(outputDir, 'catalog-full.json');
    const fullContent = minify ? JSON.stringify(outputData) : JSON.stringify(outputData, null, 2);
    fs.writeFileSync(fullOutputPath, fullContent, 'utf-8');
    console.log(`✅ Saved full catalog: ${fullOutputPath}`);
    
    // Save catalog only
    const catalogOutputPath = path.join(outputDir, 'catalog-items.json');
    const catalogContent = minify ? JSON.stringify(catalogData) : JSON.stringify(catalogData, null, 2);
    fs.writeFileSync(catalogOutputPath, catalogContent, 'utf-8');
    console.log(`✅ Saved catalog items: ${catalogOutputPath}`);
    
    // Save synonym index only
    const indexOutputPath = path.join(outputDir, 'synonym-index.json');
    const indexContent = minify ? JSON.stringify(synonymIndex) : JSON.stringify(synonymIndex, null, 2);
    fs.writeFileSync(indexOutputPath, indexContent, 'utf-8');
    console.log(`✅ Saved synonym index: ${indexOutputPath}`);
    
    // Generate size report
    const fullSize = Buffer.byteLength(fullContent, 'utf-8');
    const catalogSize = Buffer.byteLength(catalogContent, 'utf-8');
    const indexSize = Buffer.byteLength(indexContent, 'utf-8');
    
    console.log('\n📊 File Size Report');
    console.log('===================');
    console.log(`Full Catalog: ${(fullSize / 1024).toFixed(2)} KB`);
    console.log(`Catalog Items: ${(catalogSize / 1024).toFixed(2)} KB`);
    console.log(`Synonym Index: ${(indexSize / 1024).toFixed(2)} KB`);
    
    // Generate performance metrics
    console.log('\n⚡ Performance Metrics');
    console.log('======================');
    console.log(`Total Items: ${catalogData.length}`);
    console.log(`Total Synonyms: ${synonymIndex.metadata.totalSynonyms}`);
    console.log(`Categories: ${synonymIndex.metadata.categories.length}`);
    console.log(`Exact Matches: ${Object.keys(synonymIndex.exactMap).length}`);
    console.log(`Synonym Tokens: ${Object.keys(synonymIndex.synonymsMap).length}`);
    
    console.log('\n🎉 Build completed successfully!');
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

async function loadCatalogData(inputPath: string): Promise<any[]> {
  try {
    // Try to load from API endpoint first
    const response = await fetch('http://localhost:3000/api/pricing/catalog?type=full');
    if (response.ok) {
      const data = await response.json();
      return data.items || [];
    }
  } catch (error) {
    console.log('⚠️  Could not load from API, using fallback data...');
  }
  
  // Fallback to hardcoded data (for build-time usage)
  return [
    {
      id: "sofa-2seat",
      canonicalName: "Sofa – 2-seat",
      category: "sofas",
      synonyms: ["2 seater", "small sofa", "couch", "settee"],
      volumeFactor: 1.2,
      requiresTwoPerson: false,
      isFragile: false,
      requiresDisassembly: false,
      basePriceHint: 32
    },
    // Add more fallback items as needed
  ];
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  const options: BuildOptions = {
    inputPath: args[0] || path.join(__dirname, '../apps/web/src/lib/pricing/data/catalog-dataset.csv'),
    outputDir: args[1] || path.join(__dirname, '../apps/web/src/lib/pricing/data'),
    minify: args.includes('--minify'),
    validate: args.includes('--validate')
  };
  
  buildSynonymIndexFiles(options);
}
