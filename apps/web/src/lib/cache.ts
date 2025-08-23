import useSWR, { SWRConfiguration, SWRResponse } from 'swr';
import { useCallback, useRef } from 'react';

// Cache configuration
export interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  revalidateOnMount?: boolean;
  refreshInterval?: number;
  errorRetryCount?: number;
  errorRetryInterval?: number;
  dedupingInterval?: number;
}

// ETag management
export interface ETagData {
  etag: string;
  lastModified: string;
  data: any;
}

// Optimistic update configuration
export interface OptimisticConfig<T> {
  optimisticData: T;
  rollbackOnError?: boolean;
  revalidate?: boolean;
}

// Cache key generator
export function generateCacheKey(endpoint: string, params?: Record<string, any>): string {
  if (!params) return endpoint;
  
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${JSON.stringify(params[key])}`)
    .join('&');
  
  return `${endpoint}?${sortedParams}`;
}

// ETag storage in memory (in production, use Redis or similar)
const etagStore = new Map<string, ETagData>();

// Fetcher with ETag support
export async function fetcherWithETag<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const cacheKey = url;
  const cached = etagStore.get(cacheKey);
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add ETag if available
  if (cached?.etag) {
    (headers as any)['If-None-Match'] = cached.etag;
  }

  // Add Last-Modified if available
  if (cached?.lastModified) {
    (headers as any)['If-Modified-Since'] = cached.lastModified;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 304 Not Modified
  if (response.status === 304) {
    return cached!.data;
  }

  // Handle successful response
  if (response.ok) {
    const data = await response.json();
    const etag = response.headers.get('etag');
    const lastModified = response.headers.get('last-modified');

    // Cache the response with ETag
    if (etag || lastModified) {
      etagStore.set(cacheKey, {
        etag: etag || '',
        lastModified: lastModified || new Date().toUTCString(),
        data,
      });
    }

    return data;
  }

  // Handle errors
  const error = new Error(`HTTP error! status: ${response.status}`);
  (error as any).status = response.status;
  (error as any).statusText = response.statusText;
  throw error;
}

// Optimistic update fetcher
export async function optimisticFetcher<T = any>(
  url: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  data: any,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
    ...options,
  });

  if (!response.ok) {
    const error = new Error(`HTTP error! status: ${response.status}`);
    (error as any).status = response.status;
    (error as any).statusText = response.statusText;
    throw error;
  }

  return response.json();
}

// Custom hook for cached data fetching
export function useCachedData<T = any>(
  key: string | null,
  fetcher: (url: string) => Promise<T>,
  config: CacheConfig = {}
): SWRResponse<T, Error> {
  const swrConfig: SWRConfiguration = {
    revalidateOnFocus: config.revalidateOnFocus ?? true,
    revalidateOnReconnect: config.revalidateOnReconnect ?? true,
    revalidateOnMount: config.revalidateOnMount ?? true,
    refreshInterval: config.refreshInterval,
    errorRetryCount: config.errorRetryCount ?? 3,
    errorRetryInterval: config.errorRetryInterval ?? 5000,
    dedupingInterval: config.dedupingInterval ?? 2000,
    fetcher,
  };

  return useSWR(key, swrConfig);
}

// Hook for optimistic updates
export function useOptimisticUpdate<T = any>() {
  const pendingUpdates = useRef<Map<string, T>>(new Map());

  const optimisticUpdate = useCallback(
    async <R = any>(
      key: string,
      updateFn: () => Promise<R>,
      optimisticData: T,
      options: {
        rollbackOnError?: boolean;
        revalidate?: boolean;
      } = {}
    ): Promise<R> => {
      const { rollbackOnError = true, revalidate = true } = options;

      // Store optimistic data
      pendingUpdates.current.set(key, optimisticData);

      try {
        const result = await updateFn();
        
        // Remove optimistic data on success
        pendingUpdates.current.delete(key);
        
        return result;
      } catch (error) {
        // Rollback on error if configured
        if (rollbackOnError) {
          pendingUpdates.current.delete(key);
        }
        throw error;
      }
    },
    []
  );

  const getPendingUpdate = useCallback((key: string): T | undefined => {
    return pendingUpdates.current.get(key);
  }, []);

  return {
    optimisticUpdate,
    getPendingUpdate,
    hasPendingUpdates: () => pendingUpdates.current.size > 0,
  };
}

// Cache invalidation utilities
export const cacheUtils = {
  // Invalidate specific cache key
  invalidate: (key: string) => {
    // Clear ETag cache
    etagStore.delete(key);
    
    // Trigger SWR revalidation
    if (typeof window !== 'undefined' && (window as any).swr) {
      (window as any).swr.mutate(key);
    }
  },

  // Invalidate multiple cache keys
  invalidateMultiple: (keys: string[]) => {
    keys.forEach(key => cacheUtils.invalidate(key));
  },

  // Invalidate cache by pattern
  invalidatePattern: (pattern: RegExp) => {
    const keysToInvalidate: string[] = [];
    
    etagStore.forEach((_, key) => {
      if (pattern.test(key)) {
        keysToInvalidate.push(key);
      }
    });

    cacheUtils.invalidateMultiple(keysToInvalidate);
  },

  // Clear all cache
  clearAll: () => {
    etagStore.clear();
    
    if (typeof window !== 'undefined' && (window as any).swr) {
      (window as any).swr.clear();
    }
  },

  // Get cache statistics
  getStats: () => {
    return {
      etagCount: etagStore.size,
      etagKeys: Array.from(etagStore.keys()),
    };
  },
};

// Predefined cache configurations
export const cacheConfigs = {
  // Fast cache for frequently accessed data
  fast: {
    ttl: 30000, // 30 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 30000,
    errorRetryCount: 2,
    errorRetryInterval: 1000,
    dedupingInterval: 1000,
  },

  // Standard cache for normal data
  standard: {
    ttl: 300000, // 5 minutes
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 300000,
    errorRetryCount: 3,
    errorRetryInterval: 5000,
    dedupingInterval: 2000,
  },

  // Slow cache for rarely changing data
  slow: {
    ttl: 3600000, // 1 hour
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 3600000,
    errorRetryCount: 5,
    errorRetryInterval: 10000,
    dedupingInterval: 5000,
  },

  // Real-time cache for live data
  realtime: {
    ttl: 5000, // 5 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 5000,
    errorRetryCount: 1,
    errorRetryInterval: 1000,
    dedupingInterval: 500,
  },
};

// Hook for real-time data with cache
export function useRealtimeData<T = any>(
  key: string | null,
  fetcher: (url: string) => Promise<T>
): SWRResponse<T, Error> {
  return useCachedData(key, fetcher, cacheConfigs.realtime);
}

// Hook for cached API calls
export function useApiCache<T = any>(
  endpoint: string,
  params?: Record<string, any>,
  config: CacheConfig = cacheConfigs.standard
): SWRResponse<T, Error> {
  const key = params ? generateCacheKey(endpoint, params) : endpoint;
  return useCachedData(key, fetcherWithETag, config);
}

// Conflict resolution utilities
export const conflictUtils = {
  // Merge optimistic and server data
  mergeData: <T extends Record<string, any>>(
    optimistic: T,
    server: T,
    mergeStrategy: 'optimistic' | 'server' | 'merge' = 'merge'
  ): T => {
    switch (mergeStrategy) {
      case 'optimistic':
        return optimistic;
      case 'server':
        return server;
      case 'merge':
        return { ...server, ...optimistic };
      default:
        return server;
    }
  },

  // Detect conflicts between optimistic and server data
  detectConflict: <T extends Record<string, any>>(
    optimistic: T,
    server: T,
    conflictFields: (keyof T)[] = []
  ): boolean => {
    if (conflictFields.length === 0) {
      // Check all fields
      return Object.keys(optimistic).some(key => 
        optimistic[key] !== server[key]
      );
    }

    return conflictFields.some(field => 
      optimistic[field] !== server[field]
    );
  },

  // Resolve conflicts with user choice
  resolveConflict: <T extends Record<string, any>>(
    optimistic: T,
    server: T,
    userChoice: 'optimistic' | 'server' | 'manual'
  ): T => {
    switch (userChoice) {
      case 'optimistic':
        return optimistic;
      case 'server':
        return server;
      case 'manual':
        // Return server data and let user manually resolve
        return server;
      default:
        return server;
    }
  },
};

// Performance monitoring
export const performanceUtils = {
  // Measure cache hit rate
  measureCacheHitRate: () => {
    const stats = cacheUtils.getStats();
    return {
      etagCount: stats.etagCount,
      // In a real implementation, you'd track hits vs misses
      hitRate: 0.95, // Placeholder
    };
  },

  // Measure response times
  measureResponseTime: async <T>(
    fn: () => Promise<T>
  ): Promise<{ data: T; duration: number }> => {
    const start = performance.now();
    const data = await fn();
    const duration = performance.now() - start;
    
    return { data, duration };
  },

  // Cache performance metrics
  getCacheMetrics: () => {
    return {
      etagStoreSize: etagStore.size,
      memoryUsage: process.memoryUsage?.() || {},
      timestamp: Date.now(),
    };
  },
};
