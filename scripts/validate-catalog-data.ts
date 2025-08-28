#!/usr/bin/env tsx

import { promises as fs } from 'fs';
import path from 'path';
import { SynonymIndexBuilder } from '../apps/web/src/lib/pricing/build-synonym-index';
import { CatalogItem } from '../apps/web/src/lib/pricing/types';
import { isValidCategory } from '../apps/web/src/lib/pricing/category-registry';

interface ValidationReport {
  totalRows: number;
  validRows: number;
  errors: string[];
  warnings: string[];
  categoryStats: Record<string, number>;
  volumeFactorStats: {
    min: number;
    max: number;
    average: number;
  };
  duplicateIds: string[];
  invalidCategories: string[];
  emptySynonyms: string[];
  invalidBooleans: string[];
  invalidNumbers: string[];
}

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

async function validateCatalogData(): Promise<ValidationReport> {
  const report: ValidationReport = {
    totalRows: 0,
    validRows: 0,
    errors: [],
    warnings: [],
    categoryStats: {},
    volumeFactorStats: {
      min: Infinity,
      max: -Infinity,
      average: 0
    },
    duplicateIds: [],
    invalidCategories: [],
    emptySynonyms: [],
    invalidBooleans: [],
    invalidNumbers: []
  };

  try {
    // Read the CSV file
    const csvPath = path.join(process.cwd(), 'apps/web/src/lib/pricing/data/catalog-dataset.csv');
    const csvContent = await fs.readFile(csvPath, 'utf-8');
    
    const lines = csvContent.trim().split('\n');
    const headers = parseCSVLine(lines[0]);
    const items: CatalogItem[] = [];
    const seenIds = new Set<string>();
    
    report.totalRows = lines.length - 1; // Exclude header
    
    // Validate header
    if (headers.length !== 9) {
      report.errors.push(`Invalid header: expected 9 columns, got ${headers.length}`);
    }
    
    const expectedHeaders = [
      'id', 'canonicalName', 'category', 'synonyms', 
      'volumeFactor', 'requiresTwoPerson', 'isFragile', 
      'requiresDisassembly', 'basePriceHint'
    ];
    
    expectedHeaders.forEach((expected, index) => {
      if (headers[index] !== expected) {
        report.errors.push(`Header mismatch at column ${index}: expected "${expected}", got "${headers[index]}"`);
      }
    });
    
    // Parse and validate each row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) {
        report.warnings.push(`Empty line at row ${i + 1}`);
        continue;
      }
      
      const values = parseCSVLine(line);
      
      // Check column count
      if (values.length !== headers.length) {
        report.errors.push(`Row ${i + 1}: expected ${headers.length} columns, got ${values.length}`);
        continue;
      }
      
      // Check for duplicate IDs
      const id = values[0];
      if (seenIds.has(id)) {
        report.duplicateIds.push(id);
      } else {
        seenIds.add(id);
      }
      
      // Validate category
      const category = values[2];
      if (!isValidCategory(category)) {
        report.invalidCategories.push(`${id}: "${category}"`);
      }
      
      // Count categories
      report.categoryStats[category] = (report.categoryStats[category] || 0) + 1;
      
      // Validate synonyms
      const synonyms = values[3];
      if (!synonyms || synonyms.trim().length === 0) {
        report.emptySynonyms.push(id);
      }
      
      // Validate volume factor
      const volumeFactor = parseFloat(values[4]);
      if (isNaN(volumeFactor)) {
        report.invalidNumbers.push(`${id}: volumeFactor "${values[4]}" is not a number`);
      } else {
        if (volumeFactor < 0) {
          report.errors.push(`${id}: volumeFactor cannot be negative: ${volumeFactor}`);
        }
        if (volumeFactor > 10) {
          report.warnings.push(`${id}: volumeFactor seems unusually high: ${volumeFactor}`);
        }
        
        report.volumeFactorStats.min = Math.min(report.volumeFactorStats.min, volumeFactor);
        report.volumeFactorStats.max = Math.max(report.volumeFactorStats.max, volumeFactor);
      }
      
      // Validate booleans
      const requiresTwoPerson = values[5];
      const isFragile = values[6];
      const requiresDisassembly = values[7];
      
      if (!['true', 'false'].includes(requiresTwoPerson)) {
        report.invalidBooleans.push(`${id}: requiresTwoPerson "${requiresTwoPerson}" is not a valid boolean`);
      }
      if (!['true', 'false'].includes(isFragile)) {
        report.invalidBooleans.push(`${id}: isFragile "${isFragile}" is not a valid boolean`);
      }
      if (!['true', 'false'].includes(requiresDisassembly)) {
        report.invalidBooleans.push(`${id}: requiresDisassembly "${requiresDisassembly}" is not a valid boolean`);
      }
      
      // Validate base price hint
      const basePriceHint = parseInt(values[8]);
      if (isNaN(basePriceHint) || basePriceHint < 0) {
        report.invalidNumbers.push(`${id}: basePriceHint "${values[8]}" is not a valid positive integer`);
      }
      
      // Create item object for further validation
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
        report.validRows++;
      } catch (error) {
        report.errors.push(`Row ${i + 1}: failed to parse item: ${error}`);
      }
    }
    
    // Calculate volume factor statistics
    if (items.length > 0) {
      const totalVolumeFactor = items.reduce((sum, item) => sum + item.volumeFactor, 0);
      report.volumeFactorStats.average = totalVolumeFactor / items.length;
    }
    
    // Use SynonymIndexBuilder for additional validation
    if (items.length > 0) {
      const builder = new SynonymIndexBuilder(items);
      const builderErrors = builder.validateCatalog();
      report.errors.push(...builderErrors);
    }
    
  } catch (error) {
    report.errors.push(`Failed to read or parse CSV file: ${error}`);
  }
  
  return report;
}

function printReport(report: ValidationReport): void {
  console.log('\n=== CATALOG DATA VALIDATION REPORT ===\n');
  
  console.log(`📊 SUMMARY:`);
  console.log(`   Total rows: ${report.totalRows}`);
  console.log(`   Valid rows: ${report.validRows}`);
  console.log(`   Errors: ${report.errors.length}`);
  console.log(`   Warnings: ${report.warnings.length}`);
  
  if (report.errors.length === 0) {
    console.log('\n✅ No validation errors found!');
  } else {
    console.log('\n❌ VALIDATION ERRORS:');
    report.errors.forEach(error => console.log(`   • ${error}`));
  }
  
  if (report.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    report.warnings.forEach(warning => console.log(`   • ${warning}`));
  }
  
  if (report.duplicateIds.length > 0) {
    console.log('\n🔄 DUPLICATE IDs:');
    report.duplicateIds.forEach(id => console.log(`   • ${id}`));
  }
  
  if (report.invalidCategories.length > 0) {
    console.log('\n🏷️  INVALID CATEGORIES:');
    report.invalidCategories.forEach(cat => console.log(`   • ${cat}`));
  }
  
  if (report.emptySynonyms.length > 0) {
    console.log('\n📝 EMPTY SYNONYMS:');
    report.emptySynonyms.forEach(id => console.log(`   • ${id}`));
  }
  
  if (report.invalidBooleans.length > 0) {
    console.log('\n🔘 INVALID BOOLEANS:');
    report.invalidBooleans.forEach(bool => console.log(`   • ${bool}`));
  }
  
  if (report.invalidNumbers.length > 0) {
    console.log('\n🔢 INVALID NUMBERS:');
    report.invalidNumbers.forEach(num => console.log(`   • ${num}`));
  }
  
  console.log('\n📈 CATEGORY STATISTICS:');
  Object.entries(report.categoryStats)
    .sort(([, a], [, b]) => b - a)
    .forEach(([category, count]) => {
      console.log(`   ${category}: ${count} items`);
    });
  
  console.log('\n📏 VOLUME FACTOR STATISTICS:');
  console.log(`   Min: ${report.volumeFactorStats.min}`);
  console.log(`   Max: ${report.volumeFactorStats.max}`);
  console.log(`   Average: ${report.volumeFactorStats.average.toFixed(2)}`);
  
  console.log('\n' + '='.repeat(50));
}

async function main() {
  try {
    console.log('🔍 Validating catalog data...');
    const report = await validateCatalogData();
    printReport(report);
    
    if (report.errors.length > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
