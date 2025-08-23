import { NextResponse } from "next/server";

const TIMEOUT_MS = 3500;

function withTimeout<T>(p: Promise<T>, ms: number) {
  return Promise.race([
    p,
    new Promise<never>((_, rej) => setTimeout(() => rej(new Error("UPSTREAM_TIMEOUT")), ms)),
  ]);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const country = url.searchParams.get("country") || "GB";
  const limit = Number(url.searchParams.get("limit") || "7");

  // Never 503 the UI for empty/short queries
  if (q.length < 3) {
    return NextResponse.json([], { status: 200, headers: nocache() });
  }

  const token =
    process.env.MAPBOX_TOKEN ||
    process.env.MAPBOX_ACCESS_TOKEN ||
    process.env.MAPBOX_SERVER_TOKEN ||
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
    "";

  // If no token, fail-soft with empty data (200)
  if (!token) {
    console.warn("[PLACES] Missing MAPBOX_TOKEN");
    return NextResponse.json([], { status: 200, headers: nocache() });
  }

  try {
    // Classic, stable Mapbox endpoint
    const mbUrl = new URL(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json`
    );
    mbUrl.searchParams.set("access_token", token);
    mbUrl.searchParams.set("limit", String(Math.max(1, Math.min(10, limit))));
    mbUrl.searchParams.set("country", country);
    mbUrl.searchParams.set("types", "address,poi");
    mbUrl.searchParams.set("autocomplete", "true");
    mbUrl.searchParams.set("language", "en");

    // Optional proximity bias (lng,lat)
    const prox = url.searchParams.get("proximity");
    if (prox && /-?\d+\.?\d*,\s*-?\d+\.?\d*/.test(prox)) {
      mbUrl.searchParams.set("proximity", prox);
    }

    const upstream = await withTimeout(fetch(mbUrl.toString(), { cache: "no-store" }), TIMEOUT_MS);

    // Handle upstream errors & rate limits gracefully
    const ok = (upstream as Response).ok;
    const status = (upstream as Response).status;

    if (!ok) {
      // 429 or 5xx → return empty suggestions with 200 so UI doesn’t explode
      console.warn("[PLACES] Upstream error", status);
      return NextResponse.json([], { status: 200, headers: softCache() });
    }

    const data = (await (upstream as Response).json()) as any;
    
    // Debug logging
    console.log('[PLACES] Raw Mapbox response:', JSON.stringify(data, null, 2));

    function mapboxFeatureToAddress(f: any) {
      const ctx = Array.isArray(f?.context) ? f.context : [];
      const get = (prefix: string) => ctx.find((c: any) => typeof c?.id === 'string' && c.id.startsWith(prefix))?.text || '';

      const postcode = f?.properties?.postcode || get('postcode');
      const city = get('place') || get('locality') || get('district') || f?.properties?.place || '';
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
      
      // Final fallback
      if (!line1 || line1.length < 3) {
        line1 = f?.place_name || '';
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
      };
    }

    const suggestions = ((data?.features || []) as any[]).slice(0, limit).map(mapboxFeatureToAddress);
    
    // Debug logging
    console.log('[PLACES] Processed suggestions:', JSON.stringify(suggestions, null, 2));

    return NextResponse.json(suggestions, { status: 200, headers: softCache() });
  } catch (err: any) {
    // Timeouts, network errors → return [] with 200
    console.warn("[PLACES] Exception", err?.message || err);
    return NextResponse.json([], { status: 200, headers: nocache() });
  }
}

function softCache() {
  return {
    "Cache-Control": "public, max-age=5, s-maxage=60, stale-while-revalidate=120",
  } as Record<string, string>;
}
function nocache() {
  return { "Cache-Control": "no-store" } as Record<string, string>;
}


