// constants/search.ts
export const SEARCH_CONSTANTS = {
  RESULTS_PER_PAGE: 10,
  MIN_SIMILARITY_THRESHOLD: 0.3,
  HIGHLIGHT_LENGTH: 300,
  CACHE_DURATION: 3600, // 1 hour in seconds
  MAX_QUERY_LENGTH: 500,
  VECTOR_DIMENSIONS: 1024,
  RANKING_WEIGHTS: {
    VECTOR_SIMILARITY: 0.7,
    TEXT_SIMILARITY: 0.3
  },
  CACHE_KEYS: {
    SEARCH_PREFIX: 'search:',
    VECTOR_PREFIX: 'vector:'
  }
};

// types/search.ts
export interface SearchFilters {
  category?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  metadata?: Record<string, any>;
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  url: string;
  category: string;
  date: string;
  description?: string;
  export?: string;
  similarity: number;
  textRank: number;
  metadata?: Record<string, any>;
  highlights: {
    title: string;
    description: string | null;
  };
}

export interface SearchMetadata {
  queryTime: number;
  totalResults: number;
  currentPage: number;
  totalPages: number;
  resultsPerPage: number;
  cached: boolean;
}

export interface SearchResponse {
  success: boolean;
  results?: SearchResult[];
  error?: string;
  metadata?: SearchMetadata;
}
