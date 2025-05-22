// lib/redis.ts
import { Redis } from '@upstash/redis';
import { SEARCH_CONSTANTS } from '../constants/search';
// Import or define SearchFilters type
// Define SearchFilters type here if not exported from '../types/search'
type SearchFilters = {
  // Define the properties of SearchFilters according to your requirements
  // Example:
  // category?: string;
  // tags?: string[];
};

// Import or define SearchResult type
// Replace the below with the correct import if available:
// import type { SearchResult } from '../types/search';
type SearchResult = {
  // Define the properties of SearchResult according to your requirements
  // Example:
  // id: string;
  // title: string;
  // score: number;
};

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
});

export async function getCachedSearch(
  query: string,
  page: number,
  filters?: SearchFilters
): Promise<SearchResult[] | null> {
  const cacheKey = `${SEARCH_CONSTANTS.CACHE_KEYS.SEARCH_PREFIX}${query}:${page}:${JSON.stringify(filters)}`;
  const cached = await redis.get(cacheKey);
  return cached ? JSON.parse(cached as string) : null;
}

export async function setCachedSearch(
  query: string,
  page: number,
  results: SearchResult[],
  filters?: SearchFilters
): Promise<void> {
  const cacheKey = `${SEARCH_CONSTANTS.CACHE_KEYS.SEARCH_PREFIX}${query}:${page}:${JSON.stringify(filters)}`;
  await redis.set(
    cacheKey,
    JSON.stringify(results),
    { ex: SEARCH_CONSTANTS.CACHE_DURATION }
  );
}

export async function getCachedVector(
  text: string
): Promise<number[] | null> {
  const cacheKey = `${SEARCH_CONSTANTS.CACHE_KEYS.VECTOR_PREFIX}${text}`;
  const cached = await redis.get(cacheKey);
  return cached ? JSON.parse(cached as string) : null;
}

export async function setCachedVector(
  text: string,
  vector: number[]
): Promise<void> {
  const cacheKey = `${SEARCH_CONSTANTS.CACHE_KEYS.VECTOR_PREFIX}${text}`;
    await redis.set(
      cacheKey,
      JSON.stringify(vector),
      { ex: SEARCH_CONSTANTS.CACHE_DURATION }
    );
  }
