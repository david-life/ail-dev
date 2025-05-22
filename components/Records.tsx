import { useEffect, useState, useCallback } from 'react';
import styles from "../styles/DoDDeliverables.module.css";
import { debounce } from '../utils/debounce';

// Add new types
interface Record {
  id: string;
  title: string;
  content: string;
  similarity?: number;
}

interface SearchResponse {
  records: Record[];
  pagination?: {
    total: number;
    pages: number;
    current: number;
  };
}

export default function Records() {
  // Keep existing state
  const [records, setRecords] = useState<Record[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<Record[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Add new state for pagination and sorting
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState<'title' | 'similarity'>('similarity');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Add sorting function
  const sortRecords = useCallback((records: Record[]) => {
    return [...records].sort((a, b) => {
      const aValue = a[sortField] ?? 0;
      const bValue = b[sortField] ?? 0;
      return sortDirection === 'asc' ? 
        (aValue > bValue ? 1 : -1) : 
        (aValue < bValue ? 1 : -1);
    });
  }, [sortField, sortDirection]);

  // Add pagination handler
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    handleSearch(query, newPage);
  }, [query]);

  // Modify handleSearch to include pagination
  const handleSearch = useCallback(
    async (searchQuery: string, currentPage = 1) => {
      if (!sessionId) return;
      
      setIsSearching(true);
      setError(null);
      
      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: searchQuery,
            sessionId,
            page: currentPage,
            sortField,
            sortDirection
          }),
        });

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const results: SearchResponse = await response.json();
        setFilteredRecords(sortRecords(results.records));
        if (results.pagination) {
          setTotalPages(results.pagination.pages);
        }
      } catch (err) {
        setError('Search failed. Please try again.');
        const basicResults = records.filter(record =>
          record.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredRecords(sortRecords(basicResults));
      } finally {
        setIsSearching(false);
      }
    },
    [sessionId, records, sortRecords, sortField, sortDirection]
  );

  // Add sort handler
  const handleSort = useCallback((field: 'title' | 'similarity') => {
    setSortField(field);
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchValue: string) => {
      setPage(1); // Reset to first page on new search
      handleSearch(searchValue, 1);
    }, 300),
    [handleSearch]
  );

  // Keep existing return statement but add new UI elements
  return (
    <div className={styles.container}>
      <div className={styles.searchContainer}>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            debouncedSearch(e.target.value);
          }}
          placeholder="Semantic search..."
          className={styles.searchInput}
          disabled={!sessionId}
        />
        {isSearching && <div className={styles.spinner}>Searching...</div>}
        {error && <div className={styles.error}>{error}</div>}
        
        {/* Add sorting controls */}
        <div className={styles.sortControls}>
          <button 
            onClick={() => handleSort('title')}
            className={sortField === 'title' ? styles.active : ''}
          >
            Sort by Title {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button 
            onClick={() => handleSort('similarity')}
            className={sortField === 'similarity' ? styles.active : ''}
          >
            Sort by Similarity {sortField === 'similarity' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      <div className={styles.results}>
        {filteredRecords.map((record) => (
          <div key={record.id} className={styles.recordCard}>
            <h3>{record.title}</h3>
            <p>{record.content}</p>
            <span className={styles.similarity}>
              Similarity: {Math.round((record.similarity ?? 0) * 100)}%
            </span>
          </div>
        ))}
      </div>

      {/* Add pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button 
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            Previous
          </button>
          <span>{page} of {totalPages}</span>
          <button 
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
