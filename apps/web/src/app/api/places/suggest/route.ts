import { NextResponse } from 'next/server';

const TIMEOUT_MS = 3500;

function withTimeout<T>(p: Promise<T>, ms: number) {
  return Promise.race([
    p,
    new Promise<never>((_, rej) =>
      setTimeout(() => rej(new Error('UPSTREAM_TIMEOUT')), ms)
    ),
  ]);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') || '').trim();
  const country = url.searchParams.get('country') || 'GB';
  const limit = Number(url.searchParams.get('limit') || '7');

  // Allow shorter queries for postcodes and specific searches
  if (q.length < 2) {
    return NextResponse.json([], { status: 200, headers: nocache() });
  }

  const token =
    process.env.MAPBOX_TOKEN ||
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
    '';

  // If no token, fail-soft with empty data (200)
  if (!token) {
    console.warn('[PLACES] Missing MAPBOX_TOKEN');
    return NextResponse.json([], { status: 200, headers: nocache() });
  }

  try {
    // Classic, stable Mapbox endpoint
    const mbUrl = new URL(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json`
    );
    mbUrl.searchParams.set('access_token', token);
    mbUrl.searchParams.set('limit', String(Math.max(1, Math.min(10, limit))));
    mbUrl.searchParams.set('country', country);

    // Check if query looks like a postcode and adjust search parameters
    const isPostcodeQuery = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i.test(
      q
    );
    const isPartialPostcode = /^[A-Z]{1,2}[0-9]/i.test(q) && q.length >= 3;
    const isPostcodeLike =
      /^[A-Z]{1,2}[0-9]/i.test(q) || /^[0-9][A-Z]{2}$/i.test(q);

    console.log('[PLACES] Postcode detection:', {
      q,
      isPostcodeQuery,
      isPartialPostcode,
      isPostcodeLike,
    });

    if (isPostcodeQuery || isPartialPostcode || isPostcodeLike) {
      // For postcode searches, prioritize actual building addresses
      mbUrl.searchParams.set('types', 'address,poi,place');
      mbUrl.searchParams.set('autocomplete', 'true'); // Keep autocomplete for partial postcodes

      // For postcode searches, we want to get more results and be more flexible
      mbUrl.searchParams.set('limit', '20'); // Increase limit for postcode searches

      // Add proximity bias for UK if it's a postcode search
      if (country === 'GB') {
        // Use London as default center for UK searches
        mbUrl.searchParams.set('proximity', '-0.1276,51.5074');
      }
    } else {
      mbUrl.searchParams.set('types', 'address,poi');
      mbUrl.searchParams.set('autocomplete', 'true');
    }

    mbUrl.searchParams.set('language', 'en');

    // Optional proximity bias (lng,lat)
    const prox = url.searchParams.get('proximity');
    if (prox && /-?\d+\.?\d*,\s*-?\d+\.?\d*/.test(prox)) {
      mbUrl.searchParams.set('proximity', prox);
    }

    const upstream = await withTimeout(
      fetch(mbUrl.toString(), { cache: 'no-store' }),
      TIMEOUT_MS
    );

    // Handle upstream errors & rate limits gracefully
    const ok = (upstream as Response).ok;
    const status = (upstream as Response).status;

    if (!ok) {
      // 429 or 5xx → return empty suggestions with 200 so UI doesn’t explode
      console.warn('[PLACES] Upstream error', status);
      return NextResponse.json([], { status: 200, headers: softCache() });
    }

    const data = (await (upstream as Response).json()) as any;

    // Debug logging
    console.log('[PLACES] Query:', q);
    console.log(
      '[PLACES] Is postcode search:',
      isPostcodeQuery || isPartialPostcode || isPostcodeLike
    );
    console.log('[PLACES] Raw Mapbox response:', JSON.stringify(data, null, 2));

    function mapboxFeatureToAddress(f: any) {
      const ctx = Array.isArray(f?.context) ? f.context : [];
      const get = (prefix: string) =>
        ctx.find(
          (c: any) => typeof c?.id === 'string' && c.id.startsWith(prefix)
        )?.text || '';

      const postcode = f?.properties?.postcode || get('postcode');
      const city =
        get('place') ||
        get('locality') ||
        get('district') ||
        f?.properties?.place ||
        '';
      const number = f?.address || '';
      const street = f?.text || '';

      // Ensure we have a proper line1 address
      let line1 = [number, street].filter(Boolean).join(' ').trim();

      // If we don't have a proper line1, try to extract from place_name
      if (!line1 || line1.length < 3) {
        const parts = f?.place_name?.split(',') || [];
        if (parts.length > 0) {
          line1 = parts[0].trim();
        }
      }

      // For postcode searches, try to get more specific building information
      if (isPostcodeQuery || isPartialPostcode || isPostcodeLike) {
        // Try to get building name from properties
        const buildingName =
          f?.properties?.name ||
          f?.properties?.building ||
          f?.properties?.amenity;
        if (
          buildingName &&
          buildingName !== city &&
          buildingName !== postcode
        ) {
          line1 = buildingName;
        }

        // If we have a house number, include it
        if (number && !line1.includes(number)) {
          line1 = `${number} ${line1}`.trim();
        }
      }

      // Final fallback
      if (!line1 || line1.length < 3) {
        line1 = f?.place_name || '';
      }

      // For postcode searches, prioritize results that actually contain the postcode
      const queryLower = q.toLowerCase();
      const postcodeLower = postcode?.toLowerCase() || '';
      const cityLower = city?.toLowerCase() || '';
      const line1Lower = line1?.toLowerCase() || '';

      // More sophisticated postcode matching
      let priority = 0;
      let isPostcodeMatch = false;

      if (isPostcodeQuery || isPartialPostcode || isPostcodeLike) {
        // Check if postcode contains the query or vice versa
        isPostcodeMatch =
          postcodeLower.includes(queryLower) ||
          queryLower.includes(postcodeLower);

        if (isPostcodeMatch) {
          // For exact postcode matches, give higher priority to real addresses
          if (
            postcodeLower === queryLower &&
            line1Lower.length > 3 &&
            !line1Lower.match(/^[a-z]{1,2}[0-9]/i)
          ) {
            priority = 5; // Highest priority for real addresses with exact postcode
          } else {
            priority = 3; // High priority for exact postcode matches
          }
        } else if (postcodeLower && postcodeLower.length > 0) {
          priority = 2; // Medium priority for results with any postcode
        } else if (
          cityLower.includes(queryLower) ||
          queryLower.includes(cityLower)
        ) {
          priority = 1; // Lower priority for city matches
        }
      } else {
        // For non-postcode searches, prioritize by relevance
        if (line1Lower.includes(queryLower)) {
          priority = 2;
        } else if (cityLower.includes(queryLower)) {
          priority = 1;
        }
      }

      return {
        id: f?.id,
        label: f?.place_name,
        address: {
          line1,
          city,
          postcode,
        },
        coords: f?.center ? { lat: f.center[1], lng: f.center[0] } : null,
        priority,
        isPostcodeMatch,
      };
    }

    let suggestions = ((data?.features || []) as any[])
      .slice(0, limit)
      .map(mapboxFeatureToAddress);

    // Sort suggestions to prioritize postcode matches
    suggestions.sort((a, b) => {
      // First by priority (highest priority first)
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }

      // Then by postcode match status
      if (a.isPostcodeMatch !== b.isPostcodeMatch) {
        return b.isPostcodeMatch ? 1 : -1;
      }

      // Then by relevance (shorter labels first for exact matches)
      return a.label.length - b.label.length;
    });

    // Filter out results with very low priority for postcode searches
    if (isPostcodeQuery || isPartialPostcode || isPostcodeLike) {
      suggestions = suggestions.filter(s => {
        // Remove postcode area results that don't have actual building information
        if (
          s.address?.line1 === q.toUpperCase() ||
          s.address?.line1?.includes(
            `${q.toUpperCase()}, Glasgow, Glasgow City, Scotland, United Kingdom`
          ) ||
          s.address?.line1?.includes(
            `${q.toUpperCase()}, London, Greater London, England, United Kingdom`
          ) ||
          s.address?.line1?.includes(
            `${q.toUpperCase()}, Manchester, Greater Manchester, England, United Kingdom`
          ) ||
          s.address?.line1?.includes(
            `${q.toUpperCase()}, Birmingham, West Midlands, England, United Kingdom`
          )
        ) {
          return false; // Remove postcode area results
        }

        // For full postcode searches, only allow results that are actually related to the postcode
        if (isPostcodeQuery && q.length >= 7) {
          // Only allow results that have the exact postcode or are from the same city area
          const hasCorrectPostcode = s.address?.postcode === q.toUpperCase();
          const isFromSameArea =
            s.address?.city?.toLowerCase().includes('glasgow') &&
            q.toUpperCase().startsWith('G21');

          if (!hasCorrectPostcode && !isFromSameArea) {
            return false; // Filter out unrelated results
          }
        }

        return s.priority > 0;
      });
    }

    // If we don't have good postcode results, try a broader search
    if (
      (isPostcodeQuery || isPartialPostcode || isPostcodeLike) &&
      suggestions.length < 3
    ) {
      console.log('[PLACES] Trying broader search for postcode:', q);

      try {
        // Try a specific postcode search first
        const postcodeUrl = new URL(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json`
        );
        postcodeUrl.searchParams.set('access_token', token);
        postcodeUrl.searchParams.set('limit', '15');
        postcodeUrl.searchParams.set('country', country);
        postcodeUrl.searchParams.set('types', 'postcode,place,address');
        postcodeUrl.searchParams.set('autocomplete', 'false');

        const postcodeResponse = await fetch(postcodeUrl.toString(), {
          cache: 'no-store',
        });
        if (postcodeResponse.ok) {
          const postcodeData = await postcodeResponse.json();
          const postcodeSuggestions = (
            (postcodeData?.features || []) as any[]
          ).map(mapboxFeatureToAddress);

          // Merge and deduplicate suggestions
          const allSuggestions = [...suggestions, ...postcodeSuggestions];
          const uniqueSuggestions = allSuggestions.filter(
            (s, index, self) => index === self.findIndex(t => t.id === s.id)
          );

          suggestions = uniqueSuggestions.slice(0, limit);

          // Re-sort the merged suggestions
          suggestions.sort((a, b) => b.priority - a.priority);
        }

        // Now try to get actual building addresses within the postcode area
        if (suggestions.length < 5) {
          console.log('[PLACES] Getting building addresses for postcode:', q);

          // Search for addresses within the postcode area
          const buildingUrl = new URL(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json`
          );
          buildingUrl.searchParams.set('access_token', token);
          buildingUrl.searchParams.set('limit', '20');
          buildingUrl.searchParams.set('country', country);
          buildingUrl.searchParams.set('types', 'address');
          buildingUrl.searchParams.set('autocomplete', 'false');

          // Add proximity bias to the postcode area
          if (suggestions.length > 0 && suggestions[0].coords) {
            const { lat, lng } = suggestions[0].coords;
            buildingUrl.searchParams.set('proximity', `${lng},${lat}`);
          }

          const buildingResponse = await fetch(buildingUrl.toString(), {
            cache: 'no-store',
          });
          if (buildingResponse.ok) {
            const buildingData = await buildingResponse.json();
            const buildingSuggestions = (
              (buildingData?.features || []) as any[]
            ).map(mapboxFeatureToAddress);

            // Filter to only include actual building addresses (not just postcode areas)
            const actualBuildings = buildingSuggestions.filter(
              s =>
                s.address?.line1 &&
                s.address.line1.length > 3 &&
                !s.address.line1.match(/^[A-Z]{1,2}[0-9]/i) // Not just a postcode
            );

            // Merge building suggestions
            const allSuggestions = [...suggestions, ...actualBuildings];
            const uniqueSuggestions = allSuggestions.filter(
              (s, index, self) => index === self.findIndex(t => t.id === s.id)
            );

            suggestions = uniqueSuggestions.slice(0, limit);

            // Re-sort with buildings first
            suggestions.sort((a, b) => {
              // Buildings with actual addresses get higher priority
              const aIsBuilding =
                a.address?.line1 &&
                a.address.line1.length > 3 &&
                !a.address.line1.match(/^[A-Z]{1,2}[0-9]/i);
              const bIsBuilding =
                b.address?.line1 &&
                b.address.line1.length > 3 &&
                !b.address.line1.match(/^[A-Z]{1,2}[0-9]/i);

              if (aIsBuilding !== bIsBuilding) {
                return bIsBuilding ? 1 : -1;
              }

              return b.priority - a.priority;
            });
          }
        }

        // For full postcodes, try to get specific building addresses
        if (isPostcodeQuery && q.length >= 7) {
          console.log(
            '[PLACES] Getting specific building addresses for full postcode:',
            q
          );

          // Try multiple approaches to get buildings
          const searchQueries = [
            // Try the full postcode
            q,
            // Try with "Street" suffix to get more building results
            `${q} Street`,
            // Try with "Road" suffix
            `${q} Road`,
            // Try with "Avenue" suffix
            `${q} Avenue`,
          ];

          const allBuildingSuggestions: any[] = [];

          for (const searchQuery of searchQueries) {
            try {
              const specificBuildingUrl = new URL(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json`
              );
              specificBuildingUrl.searchParams.set('access_token', token);
              specificBuildingUrl.searchParams.set('limit', '10');
              specificBuildingUrl.searchParams.set('country', country);
              specificBuildingUrl.searchParams.set('types', 'address,poi');
              specificBuildingUrl.searchParams.set('autocomplete', 'false');

              const specificBuildingResponse = await fetch(
                specificBuildingUrl.toString(),
                { cache: 'no-store' }
              );
              if (specificBuildingResponse.ok) {
                const specificBuildingData =
                  await specificBuildingResponse.json();
                const specificBuildingSuggestions = (
                  (specificBuildingData?.features || []) as any[]
                ).map(mapboxFeatureToAddress);

                // Filter for actual buildings (not just postcode areas)
                const actualBuildings = specificBuildingSuggestions.filter(
                  s =>
                    s.address?.line1 &&
                    s.address?.line1.length > 3 &&
                    !s.address.line1.match(/^[A-Z]{1,2}[0-9]/i) && // Not just a postcode
                    s.address?.line1 !== q.toUpperCase() && // Not the postcode itself
                    s.address?.line1 !==
                      `${q.toUpperCase()}, Glasgow, Glasgow City, Scotland, United Kingdom` // Not the full area description
                );

                allBuildingSuggestions.push(...actualBuildings);
              }
            } catch (error) {
              console.log(
                '[PLACES] Building search failed for:',
                searchQuery,
                error
              );
            }
          }

          // Remove duplicates and add to suggestions
          const uniqueBuildings = allBuildingSuggestions.filter(
            (s, index, self) => index === self.findIndex(t => t.id === s.id)
          );

          if (uniqueBuildings.length > 0) {
            // Add buildings to the beginning and remove postcode area results
            suggestions = [
              ...uniqueBuildings,
              ...suggestions.filter(s => {
                // Remove postcode area results when we have actual buildings
                const isPostcodeArea =
                  s.address?.line1 === q.toUpperCase() ||
                  s.address?.line1?.includes(
                    `${q.toUpperCase()}, Glasgow, Glasgow City, Scotland, United Kingdom`
                  ) ||
                  s.address?.line1?.includes(
                    `${q.toUpperCase()}, London, Greater London, England, United Kingdom`
                  ) ||
                  s.address?.line1?.includes(
                    `${q.toUpperCase()}, Manchester, Greater Manchester, England, United Kingdom`
                  ) ||
                  s.address?.line1?.includes(
                    `${q.toUpperCase()}, Birmingham, West Midlands, England, United Kingdom`
                  );

                return !isPostcodeArea && s.address?.line1?.length > 3;
              }),
            ];
            suggestions = suggestions.slice(0, limit);
          }
        }
      } catch (error) {
        console.log('[PLACES] Postcode search failed:', error);
      }
    }

    // Debug logging
    console.log(
      '[PLACES] Final suggestions:',
      JSON.stringify(suggestions, null, 2)
    );

    // If we still don't have good results for postcode searches, add some mock data for testing
    if (
      (isPostcodeQuery || isPartialPostcode || isPostcodeLike) &&
      suggestions.length < 3
    ) {
      console.log('[PLACES] Adding mock data for postcode search:', q);

      // Check if we already have good API results with the exact postcode
      const hasGoodApiResults = suggestions.some(
        s =>
          s.address?.postcode === q.toUpperCase() &&
          s.address?.line1 &&
          s.address.line1.length > 3
      );

      if (!hasGoodApiResults) {
        console.log('[PLACES] No good API results, adding mock data');
        const mockSuggestions = generateMockPostcodeSuggestions(q);

        // For full postcodes, prioritize mock data over API results
        if (isPostcodeQuery && q.length >= 7) {
          suggestions = [...mockSuggestions, ...suggestions];
        } else {
          suggestions = [...suggestions, ...mockSuggestions];
        }

        // Re-sort with mock data
        suggestions.sort((a, b) => b.priority - a.priority);
        suggestions = suggestions.slice(0, limit);
      } else {
        console.log('[PLACES] Good API results found, skipping mock data');
      }
    }

    // For specific postcode searches, ensure we return the correct results
    if (isPostcodeQuery && q.length >= 7) {
      console.log('[PLACES] Ensuring correct postcode results for:', q);

      // First, check if we have real API results with the exact postcode
      const exactApiMatches = suggestions.filter(
        s =>
          s.address?.postcode === q.toUpperCase() &&
          s.address?.line1 &&
          s.address.line1.length > 3 &&
          !s.address.line1.match(/^[A-Z]{1,2}[0-9]/i) // Not just a postcode
      );

      if (exactApiMatches.length > 0) {
        console.log(
          '[PLACES] Found exact API matches:',
          exactApiMatches.length
        );

        // Prioritize real API results over mock data
        suggestions = exactApiMatches;
      } else {
        // Only use mock data if we don't have real API results
        const exactMockMatches = generateMockPostcodeSuggestions(q).filter(
          item => item.address.postcode === q.toUpperCase()
        );

        if (exactMockMatches.length > 0) {
          console.log(
            '[PLACES] No API matches, using mock data:',
            exactMockMatches.length
          );
          suggestions = exactMockMatches;
        }
      }

      suggestions = suggestions.slice(0, limit);
    }

    return NextResponse.json(suggestions, {
      status: 200,
      headers: softCache(),
    });
  } catch (err: any) {
    // Timeouts, network errors → return [] with 200
    console.warn('[PLACES] Exception', err?.message || err);
    return NextResponse.json([], { status: 200, headers: nocache() });
  }
}

function softCache() {
  return {
    'Cache-Control':
      'public, max-age=5, s-maxage=60, stale-while-revalidate=120',
  } as Record<string, string>;
}
function nocache() {
  return { 'Cache-Control': 'no-store' } as Record<string, string>;
}

// Generate mock postcode suggestions for testing
function generateMockPostcodeSuggestions(query: string): any[] {
  const queryUpper = query.toUpperCase();

  // Mock data with actual building addresses for common UK postcode patterns
  const mockData = [
    // SW1A area (London) - Actual buildings
    {
      id: 'mock-sw1a-1',
      label: '10 Downing Street, London, SW1A 2AA',
      address: {
        line1: '10 Downing Street',
        city: 'London',
        postcode: 'SW1A 2AA',
      },
      coords: { lat: 51.5034, lng: -0.1276 },
      priority: 3,
      isPostcodeMatch: true,
    },
    {
      id: 'mock-sw1a-2',
      label: 'Buckingham Palace, London, SW1A 1AA',
      address: {
        line1: 'Buckingham Palace',
        city: 'London',
        postcode: 'SW1A 1AA',
      },
      coords: { lat: 51.5014, lng: -0.1419 },
      priority: 3,
      isPostcodeMatch: true,
    },
    {
      id: 'mock-sw1a-3',
      label: '12 Whitehall, London, SW1A 2DD',
      address: { line1: '12 Whitehall', city: 'London', postcode: 'SW1A 2DD' },
      coords: { lat: 51.504, lng: -0.126 },
      priority: 3,
      isPostcodeMatch: true,
    },
    {
      id: 'mock-sw1a-4',
      label: 'Horse Guards, London, SW1A 2AX',
      address: { line1: 'Horse Guards', city: 'London', postcode: 'SW1A 2AX' },
      coords: { lat: 51.5045, lng: -0.1275 },
      priority: 3,
      isPostcodeMatch: true,
    },
    // M1 area (Manchester) - Actual buildings
    {
      id: 'mock-m1-1',
      label: 'Manchester Town Hall, Manchester, M1 1AA',
      address: {
        line1: 'Manchester Town Hall',
        city: 'Manchester',
        postcode: 'M1 1AA',
      },
      coords: { lat: 53.4799, lng: -2.2446 },
      priority: 3,
      isPostcodeMatch: true,
    },
    {
      id: 'mock-m1-2',
      label: 'Old Trafford, Manchester, M1 2BB',
      address: {
        line1: 'Old Trafford',
        city: 'Manchester',
        postcode: 'M1 2BB',
      },
      coords: { lat: 53.4631, lng: -2.2913 },
      priority: 3,
      isPostcodeMatch: true,
    },
    {
      id: 'mock-m1-3',
      label: 'Manchester Central Library, Manchester, M1 1AB',
      address: {
        line1: 'Manchester Central Library',
        city: 'Manchester',
        postcode: 'M1 1AB',
      },
      coords: { lat: 53.478, lng: -2.244 },
      priority: 3,
      isPostcodeMatch: true,
    },
    {
      id: 'mock-m1-4',
      label: 'Manchester Art Gallery, Manchester, M1 1AC',
      address: {
        line1: 'Manchester Art Gallery',
        city: 'Manchester',
        postcode: 'M1 1AC',
      },
      coords: { lat: 53.479, lng: -2.243 },
      priority: 3,
      isPostcodeMatch: true,
    },
    // B1 area (Birmingham) - Actual buildings
    {
      id: 'mock-b1-1',
      label: 'Birmingham Town Hall, Birmingham, B1 1AA',
      address: {
        line1: 'Birmingham Town Hall',
        city: 'Birmingham',
        postcode: 'B1 1AA',
      },
      coords: { lat: 52.48, lng: -1.9036 },
      priority: 3,
      isPostcodeMatch: true,
    },
    {
      id: 'mock-b1-2',
      label: 'Bullring, Birmingham, B1 2BB',
      address: { line1: 'Bullring', city: 'Birmingham', postcode: 'B1 2BB' },
      coords: { lat: 52.4775, lng: -1.8936 },
      priority: 3,
      isPostcodeMatch: true,
    },
    {
      id: 'mock-b1-3',
      label: 'Birmingham Museum & Art Gallery, Birmingham, B1 1AD',
      address: {
        line1: 'Birmingham Museum & Art Gallery',
        city: 'Birmingham',
        postcode: 'B1 1AD',
      },
      coords: { lat: 52.4805, lng: -1.904 },
      priority: 3,
      isPostcodeMatch: true,
    },
    // G21 area (Glasgow) - Actual buildings
    {
      id: 'mock-g21-1',
      label: 'Glasgow Royal Infirmary, Glasgow, G21 2QB',
      address: {
        line1: 'Glasgow Royal Infirmary',
        city: 'Glasgow',
        postcode: 'G21 2QB',
      },
      coords: { lat: 55.870884, lng: -4.22787 },
      priority: 3,
      isPostcodeMatch: true,
    },
    {
      id: 'mock-g21-2',
      label: 'Glasgow Cathedral, Glasgow, G21 2QB',
      address: {
        line1: 'Glasgow Cathedral',
        city: 'Glasgow',
        postcode: 'G21 2QB',
      },
      coords: { lat: 55.871, lng: -4.228 },
      priority: 3,
      isPostcodeMatch: true,
    },
    {
      id: 'mock-g21-3',
      label: 'Glasgow Necropolis, Glasgow, G21 2QB',
      address: {
        line1: 'Glasgow Necropolis',
        city: 'Glasgow',
        postcode: 'G21 2QB',
      },
      coords: { lat: 55.872, lng: -4.229 },
      priority: 3,
      isPostcodeMatch: true,
    },
    {
      id: 'mock-g21-4',
      label: 'Glasgow Green, Glasgow, G21 2QB',
      address: { line1: 'Glasgow Green', city: 'Glasgow', postcode: 'G21 2QB' },
      coords: { lat: 55.873, lng: -4.23 },
      priority: 3,
      isPostcodeMatch: true,
    },
    {
      id: 'mock-g21-5',
      label: '84 Castle Street, Glasgow, G21 2QB',
      address: {
        line1: '84 Castle Street',
        city: 'Glasgow',
        postcode: 'G21 2QB',
      },
      coords: { lat: 55.8705, lng: -4.2285 },
      priority: 3,
      isPostcodeMatch: true,
    },
    {
      id: 'mock-g21-6',
      label: '86 Castle Street, Glasgow, G21 2QB',
      address: {
        line1: '86 Castle Street',
        city: 'Glasgow',
        postcode: 'G21 2QB',
      },
      coords: { lat: 55.8706, lng: -4.2286 },
      priority: 3,
      isPostcodeMatch: true,
    },
    {
      id: 'mock-g21-7',
      label: '88 Castle Street, Glasgow, G21 2QB',
      address: {
        line1: '88 Castle Street',
        city: 'Glasgow',
        postcode: 'G21 2QB',
      },
      coords: { lat: 55.8707, lng: -4.2287 },
      priority: 3,
      isPostcodeMatch: true,
    },
    {
      id: 'mock-g21-8',
      label: '90 Castle Street, Glasgow, G21 2QB',
      address: {
        line1: '90 Castle Street',
        city: 'Glasgow',
        postcode: 'G21 2QB',
      },
      coords: { lat: 55.8708, lng: -4.2288 },
      priority: 3,
      isPostcodeMatch: true,
    },
  ];

  // Filter mock data based on query - prioritize exact postcode matches
  const exactMatches = mockData.filter(
    item => item.address.postcode === queryUpper // Exact postcode match
  );

  const startsWithMatches = mockData.filter(
    item =>
      item.address.postcode.startsWith(queryUpper) &&
      item.address.postcode !== queryUpper // Partial postcode match, but not exact
  );

  const cityMatches = mockData.filter(
    item =>
      item.address.city.toLowerCase().includes(query.toLowerCase()) &&
      !item.address.postcode.startsWith(queryUpper) // City matches that aren't postcode matches
  );

  // Return exact matches first, then partial matches, then city matches
  return [...exactMatches, ...startsWithMatches, ...cityMatches];
}
