// utils/cache.ts
type CacheOptions = {
  maxAge?: number; // in milliseconds
  staleWhileRevalidate?: boolean;
};

class Cache {
  private cache: Map<string, { 
    value: any; 
    timestamp: number;
    isRevalidating?: boolean;
  }>;
  private defaultOptions: CacheOptions = {
    maxAge: 5 * 60 * 1000, // 5 minutes
    staleWhileRevalidate: true,
  };

  constructor() {
    this.cache = new Map();
  }

  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const opts = { ...this.defaultOptions, ...options };
    const cached = this.cache.get(key);

    // If we have a valid cache entry, return it
    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < opts.maxAge!) {
        return cached.value;
      }

      // If stale but revalidating is enabled, return stale data and refresh
      if (opts.staleWhileRevalidate && !cached.isRevalidating) {
        this.revalidate(key, fetcher);
        return cached.value;
      }
    }

    // If no cache or expired, fetch new data
    const value = await fetcher();
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });

    return value;
  }

  private async revalidate<T>(key: string, fetcher: () => Promise<T>) {
    const cached = this.cache.get(key);
    if (cached) {
      cached.isRevalidating = true;
    }

    try {
      const value = await fetcher();
      this.cache.set(key, {
        value,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Cache revalidation failed:', error);
    } finally {
      if (cached) {
        cached.isRevalidating = false;
      }
    }
  }

  clear() {
    this.cache.clear();
  }
}

export const appCache = new Cache();

// Usage example:
export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: CacheOptions
): Promise<T> {
  return appCache.get(key, fetcher, options);
}
