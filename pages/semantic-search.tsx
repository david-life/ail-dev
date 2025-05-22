import { useState } from "react";
import { useDebounce } from "use-debounce"; // To handle query debouncing
import { SearchBar } from "../components/Search/SearchBar"; // Assuming you have the SearchBar component
import { SearchResponse } from "../../types/search"; // Search result types
import { motion } from "framer-motion";
import { ArrowRightIcon } from "@heroicons/react/20/solid"; // HeroIcons for UI
import { useRouter } from "next/router";

const SemanticSearch = () => {
  const router = useRouter();
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<SearchResponse["results"]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [debouncedQuery] = useDebounce(query, 500); // Debounce input by 500ms

  // Function to handle the actual search
  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);
    setResults([]);

    try {
      // Call the backend API to perform the semantic search
      const res = await fetch("/api/semantic-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to fetch search results.");
      } else {
        setResults(data.results);
      }
    } catch (error) {
      console.error("Error during search:", error);
      setError("An error occurred during the search.");
    } finally {
      setIsSearching(false);
    }
  };

  // Automatically trigger the search on debounced query
  useState(() => {
    if (debouncedQuery) {
      handleSearch(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <div className="semantic-search-container max-w-3xl mx-auto p-6">
      {/* Search Bar Component */}
      <SearchBar onSearch={(query) => setQuery(query)} isSearching={isSearching} />

      {/* Search results */}
      <motion.div
        className="search-results mt-6 space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Loading state */}
        {isSearching && (
          <div className="text-center text-gray-500">Searching...</div>
        )}

        {/* Error state */}
        {error && <div className="text-center text-red-500">{error}</div>}

        {/* No results state */}
        {results.length === 0 && !isSearching && !error && (
          <div className="text-center text-gray-500">
            No results found. Try modifying your search.
          </div>
        )}

        {/* Results */}
        {results.length > 0 && !isSearching && !error && (
          <div>
            <h2 className="text-xl font-semibold">Search Results</h2>
            <div className="mt-4">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="border-b border-gray-200 py-4"
                >
                  <h3 className="text-lg font-bold text-gray-900">{result.title}</h3>
                  <p className="text-gray-700">
                    {result.content.slice(0, 250)}...
                  </p>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 flex items-center gap-2 mt-2"
                  >
                    Read more <ArrowRightIcon className="h-5 w-5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SemanticSearch;
