// components/Search.tsx

import { useState } from "react";

const Search = () => {
  const [query, setQuery] = useState(""); // Search query state
  const [useHuggingFace, setUseHuggingFace] = useState(false); // Flag to toggle embedding method
  const [results, setResults] = useState<any[]>([]); // Store search results
  const [loading, setLoading] = useState(false); // Loading state to show when search is processing

  const handleSearch = async () => {
    if (!query.trim()) {
      alert("Please enter a search query.");
      return;
    }

    setLoading(true);

    try {
      // Make a POST request to the backend API (`/api/semantic-search`)
      const res = await fetch("/api/semantic-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, useHuggingFace }),
      });

      const data = await res.json(); // Parse the JSON response

      if (data.success) {
        setResults(data.results); // Set the search results from the API
      } else {
        alert("Search failed: " + data.error);
      }
    } catch (error) {
      console.error("Error during search:", error);
      alert("Search failed due to an error.");
    } finally {
      setLoading(false); // Set loading state to false after search completes
    }
  };

  return (
    <div className="search-container">
      <h1>Hybrid Semantic Search</h1>

      {/* Input field for search query */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter your search query"
      />

      {/* Checkbox to toggle between local and Hugging Face embeddings */}
      <div>
        <label>
          <input
            type="checkbox"
            checked={useHuggingFace}
            onChange={(e) => setUseHuggingFace(e.target.checked)}
          />
          Use Hugging Face Embeddings
        </label>
      </div>

      {/* Search button */}
      <button onClick={handleSearch} disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </button>

      {/* Displaying search results */}
      <div>
        {results.length > 0 ? (
          <ul>
            {results.map((result) => (
              <li key={result.id}>
                <h3>{result.title}</h3>
                <p>{result.content}</p>
                <p>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Read more
                  </a>
                </p>
                <p>Similarity: {result.similarity}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No results found</p>
        )}
      </div>
    </div>
  );
};

export default Search;
