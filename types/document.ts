// types/document.ts
export interface Record {
  id: string | number;
  title: string;
  description: string;
  content: string;
  category: string;
  Date?: string;
  url: string;
  publicId?: string;
  similarity?: number;
  metadata?: {
    category?: string;
    uploadDate?: string;
  };
}

// types/search.ts
export interface SearchResponse {
  success: boolean;
  results: Record[];
  error?: string;
  metadata: {
    queryTime: string;
    totalResults: number;
  };
}
