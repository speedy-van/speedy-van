'use client';

import { useEffect, useRef, useState } from 'react';

type Forecast = {
  ts: string;
  temp: number | null;
  feelsLike: number | null;
  windGust: number | null;
  pop: number | null; // 0-1
  uvi: number | null;
  condition: string;
  reference: number;
  theme: 'sunny' | 'rain' | 'clouds' | 'snow' | 'wind' | 'fog';
  desc: string;
};

const cache = new Map<string, Forecast>();

export function useForecast(
  lat?: number | null,
  lng?: number | null,
  iso?: string
) {
  const key =
    lat != null && lng != null && iso
      ? `${lat.toFixed(4)}|${lng.toFixed(4)}|${iso.slice(0, 13)}`
      : null;
  const [data, setData] = useState<Forecast | undefined>(
    key ? cache.get(key) : undefined
  );
  const [loading, setLoading] = useState<boolean>(!!key && !cache.get(key));
  const [error, setError] = useState<any>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!key) return;
    const run = async () => {
      try {
        if (cache.has(key)) {
          setData(cache.get(key));
          setLoading(false);
          return;
        }
        setLoading(true);
        abortRef.current?.abort();
        const ac = new AbortController();
        abortRef.current = ac;
        const url = `/api/weather?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}&ts=${encodeURIComponent(String(iso))}`;
        const r = await fetch(url, { signal: ac.signal });
        if (!r.ok) throw new Error(`Weather ${r.status}`);
        const j = await r.json();
        cache.set(key, j);
        setData(j);
      } catch (e) {
        if ((e as any)?.name === 'AbortError') return;
        setError(e);
      } finally {
        setLoading(false);
      }
    };
    run();
    return () => abortRef.current?.abort();
  }, [key, lat, lng, iso]);

  return { forecast: data, isLoading: loading, error };
}

export type { Forecast };
