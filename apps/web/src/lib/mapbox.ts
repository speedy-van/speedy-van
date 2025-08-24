// Server-side token (for API routes)
const SERVER_TOKEN =
  process.env.MAPBOX_TOKEN ||
  process.env.MAPBOX_ACCESS_TOKEN ||
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
  "";

// Client-side token (for browser)
export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Use appropriate token based on environment
const TOKEN = typeof window === 'undefined' ? SERVER_TOKEN : MAPBOX_TOKEN;

const BASE = "https://api.mapbox.com";

export type MBFeature = { place_name: string; center: [number, number] };

export async function geocode(query: string, sessionToken?: string) {
  const url = new URL(`${BASE}/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`);
  url.searchParams.set("access_token", TOKEN);
  url.searchParams.set("autocomplete", "true");
  url.searchParams.set("limit", "5");
  if (sessionToken) url.searchParams.set("session_token", sessionToken);
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error("geocode failed");
  const j = await r.json();
  return (j.features as any[]).map(f => ({ place_name: f.place_name, center: f.center } as MBFeature));
}

export async function directions(origin: [number, number], dest: [number, number]) {
  const path = `${BASE}/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${dest[0]},${dest[1]}`;
  const url = new URL(path);
  url.searchParams.set("access_token", TOKEN);
  url.searchParams.set("geometries", "geojson");
  url.searchParams.set("overview", "full");
  url.searchParams.set("alternatives", "false");
  url.searchParams.set("annotations", "duration,distance");
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error("directions failed");
  const j = await r.json();
  const route = j.routes?.[0];
  if (!route) return null;
  return {
    distance: route.distance as number,
    duration: route.duration as number,
    geometry: route.geometry as GeoJSON.LineString,
  };
}


