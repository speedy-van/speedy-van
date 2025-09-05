import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { SynonymIndexBuilder } from '@/lib/pricing/build-synonym-index';
import { CatalogItem } from '@/lib/pricing/types';

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
    // Read the pre-compiled JSON file for better performance
    const compiledPath = path.join(
      process.cwd(),
      'src/lib/pricing/data/catalog-dataset.compiled.json'
    );
    const compiledContent = await fs.readFile(compiledPath, 'utf-8');
    const compiledData = JSON.parse(compiledContent);

    // Read the synonym index file
    const synonymPath = path.join(
      process.cwd(),
      'src/lib/pricing/data/synonym-index.json'
    );
    const synonymContent = await fs.readFile(synonymPath, 'utf-8');
    const synonymIndex = JSON.parse(synonymContent);

    // Combine the data
    const responseData = {
      ...compiledData,
      synonymIndex,
    };

    // Return minified JSON
    return new NextResponse(JSON.stringify(responseData), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, immutable', // 5 minutes cache
        ETag: `"${Date.now()}"`,
      },
    });
  } catch (error) {
    console.error('Error compiling catalog:', error);
    return NextResponse.json(
      { error: 'Failed to compile catalog' },
      { status: 500 }
    );
  }
}
