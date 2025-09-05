// src/app/api/pricing/catalog/route.ts
// -----------------------------------------------------------------------------
// API endpoint to serve catalog dataset and compiled data.
// Provides catalog items, synonym index, and metadata.
// -----------------------------------------------------------------------------

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { buildSynonymIndex } from '@/lib/pricing/build-synonym-index';
import { loadCatalogDataset } from '@/lib/pricing/catalog-dataset';
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

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Cache for compiled data
let compiledCatalogCache: any = null;
let lastCacheUpdate = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    // Read the pre-compiled JSON file for better performance
    const compiledPath = path.join(
      process.cwd(),
      'src/lib/pricing/data/catalog-dataset.compiled.json'
    );
    const compiledContent = await fs.readFile(compiledPath, 'utf-8');
    const compiledData = JSON.parse(compiledContent);

    return NextResponse.json(compiledData.items);
  } catch (error) {
    console.error('Error reading catalog:', error);
    return NextResponse.json(
      { error: 'Failed to load catalog' },
      { status: 500 }
    );
  }
}

// POST endpoint to rebuild synonym index (admin only)
export async function POST(req: Request) {
  try {
    // Require admin authentication for modifying pricing data
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { action } = await req.json();

    if (action === 'rebuild') {
      // Clear cache and rebuild
      compiledCatalogCache = null;
      lastCacheUpdate = 0;

      const catalogItems = await loadCatalogDataset();
      const synonymIndex = buildSynonymIndex(catalogItems);

      // Log admin action for audit trail
      console.log('🔒 Admin pricing catalog rebuild:', {
        adminId: session.user.id,
        adminEmail: session.user.email,
        action: 'rebuild_synonym_index',
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        message: 'Synonym index rebuilt successfully',
        metadata: synonymIndex.metadata,
        rebuiltBy: session.user.email,
        rebuiltAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[/api/pricing/catalog] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to rebuild index' },
      { status: 500 }
    );
  }
}
