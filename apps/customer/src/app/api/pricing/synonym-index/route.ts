import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { SynonymIndexBuilder } from '@/lib/pricing/build-synonym-index';
import { CatalogItem } from '@/lib/pricing/types';
import { requireAdmin } from '@/lib/auth';

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

export async function GET() {
  try {
    // Require admin authentication for accessing pricing data structures
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Read the pre-built synonym index file for better performance
    const synonymPath = path.join(
      process.cwd(),
      'src/lib/pricing/data/synonym-index.json'
    );
    const synonymContent = await fs.readFile(synonymPath, 'utf-8');
    const synonymIndex = JSON.parse(synonymContent);

    // Read the compiled catalog for metadata
    const compiledPath = path.join(
      process.cwd(),
      'src/lib/pricing/data/catalog-dataset.compiled.json'
    );
    const compiledContent = await fs.readFile(compiledPath, 'utf-8');
    const compiledData = JSON.parse(compiledContent);

    // Return synonym index with metadata
    const responseData = {
      ...synonymIndex,
      metadata: {
        totalItems: compiledData.metadata.totalItems,
        totalSynonyms: Object.keys(synonymIndex.synonymsMap).length,
        categories: compiledData.metadata.categories,
        lastUpdated: compiledData.metadata.lastUpdated,
        version: compiledData.metadata.version,
      },
    };

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, max-age=300, immutable', // 5 minutes cache
        ETag: `"${Date.now()}"`,
      },
    });
  } catch (error) {
    console.error('Error building synonym index:', error);
    return NextResponse.json(
      { error: 'Failed to build synonym index' },
      { status: 500 }
    );
  }
}
