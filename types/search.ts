// types/search.ts
import { DocumentWithSimilarity } from './document';

export interface SearchState {
  query: string;
  loading: boolean;
  error: string | null;
  results: DocumentWithSimilarity[];
  vectorQuery: number[] | null;
}

export interface ViewOptions {
  layout: 'grid' | 'list';
  sortBy: 'date' | 'title' | 'category' | 'similarity';
  sortOrder: 'asc' | 'desc';
}
