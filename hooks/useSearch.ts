// hooks/useSearch.ts
import { useState, useCallback } from 'react';
import { debounce } from 'lodash';
import type { Record as DocumentRecord } from '../types/document';

export const useSearch = (initialRecords: Record[] = []) => {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Record[]>(initialRecords);
  const [error, setError] = useState<string | null>(null);

  const performSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setResults(initialRecords);
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        const response = await fetch('/api/semantic-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        });

        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error);
        
        setResults(data.results);
      } catch (error) {
        console.error('Search error:', error);
        setError('Search failed. Please try again.');
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [initialRecords]
  );

  return { performSearch, isSearching, results, error };
};

// hooks/useFilter.ts
import type { Record } from '../types/document';

export const useFilter = (records: DocumentRecord[]) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filteredRecords, setFilteredRecords] = useState(records);

  const applyFilters = useCallback((categories: string[]) => {
    if (categories.length === 0) {
      setFilteredRecords(records);
      return;
    }

    const filtered = records.filter(record =>
      categories.includes(record.category)
    );
    setFilteredRecords(filtered);
  }, [records]);
// hooks/useFilter.ts (continued)
  const handleCategoryChange = useCallback((category: string, isSelected: boolean) => {
    setSelectedCategories(prev => {
      const newCategories = isSelected
        ? [...prev, category]
        : prev.filter(c => c !== category);
      
      applyFilters(newCategories);
      return newCategories;
    });
  }, [applyFilters]);

  return {
    selectedCategories,
    filteredRecords,
    handleCategoryChange,
    resetFilters: () => {
      setSelectedCategories([]);
      setFilteredRecords(records);
    }
  };
};

// hooks/useViewMode.ts
import { useEffect } from 'react';

type ViewMode = 'grid' | 'list';

export const useViewMode = (defaultMode: ViewMode = 'grid') => {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultMode);
  
  // Persist view mode preference
  useEffect(() => {
    const stored = localStorage.getItem('viewMode') as ViewMode;
    if (stored) setViewMode(stored);
  }, []);

  const toggleViewMode = () => {
    const newMode = viewMode === 'grid' ? 'list' : 'grid';
    setViewMode(newMode);
    localStorage.setItem('viewMode', newMode);
  };

  return { viewMode, toggleViewMode };
};
