// src/app/api/autocomplete/addresses/route.ts
// Address autocomplete API using Mapbox geocoding
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const searchSchema = z.object({
  query: z.string().min(2).max(200),
  limit: z.number().min(1).max(10).optional().default(5),
  country: z.string().optional().default('GB'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const limit = parseInt(searchParams.get('limit') || '5');
    const country = searchParams.get('country') || 'GB';

    const validation = searchSchema.safeParse({ query, limit, country });
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid parameters',
          details: validation.error.issues 
        },
        { status: 400 }
      );
    }

    const { query: searchQuery, limit: searchLimit, country: searchCountry } = validation.data;

    // Use Mapbox Geocoding API (server-side token)
    const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN || process.env.MAPBOX_SERVER_TOKEN;
    if (!mapboxToken) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Mapbox token not configured' 
        },
        { status: 500 }
      );
    }

    const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?` +
      new URLSearchParams({
        access_token: mapboxToken,
        country: searchCountry.toLowerCase(),
        limit: searchLimit.toString(),
        types: 'address,poi',
        autocomplete: 'true',
      });

    const response = await fetch(mapboxUrl);
    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform Mapbox results to our format
    const suggestions = data.features?.map((feature: any) => ({
      id: feature.id,
      text: feature.place_name,
      description: feature.properties?.address || feature.place_name,
      metadata: {
        coordinates: feature.geometry?.coordinates,
        postcode: feature.context?.find((c: any) => c.id.startsWith('postcode'))?.text,
        city: feature.context?.find((c: any) => c.id.startsWith('place'))?.text,
        region: feature.context?.find((c: any) => c.id.startsWith('region'))?.text,
        country: feature.context?.find((c: any) => c.id.startsWith('country'))?.text,
      },
    })) || [];

    return NextResponse.json({
      success: true,
      data: {
        suggestions,
        query: searchQuery,
        total: suggestions.length,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Address autocomplete error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to search addresses',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
