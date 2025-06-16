import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchBar } from "../components/Search/SearchBar";
import { LoadingScreen } from "../components/LoadingScreen";
import { Header } from "@/components/Header/Header";
import { Sidebar } from "@/components/SideBar/SideBar";
import { GridSkeleton } from "@/components/Skeletons/GridSkeletons";
import { DocumentGrid } from "@/components/DocumentGrid/DocumentGrid";

import type { Record } from "../types/document";

export default function DoDDeliverables() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [records, setRecords] = useState<Record[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<Record[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch records initially
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await fetch("/api/records");
        const data = await response.json();

        if (!response.ok)
          throw new Error(data.error || "Failed to fetch records");

        const fetchedRecords = Array.isArray(data.data) ? data.data : [];

        setRecords(fetchedRecords);
        setFilteredRecords(fetchedRecords);
      } catch (error) {
        console.error("Error fetching records:", error);
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecords();
  }, []);

  // Search Handler with Improved Integration
  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setFilteredRecords(records);
        return;
      }

      setIsSearching(true);
      try {
        console.log(`Searching for: "${query}"`);
        const response = await fetch("/api/semantic-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Search failed");

        let results = data.results;

        // Apply category filters
        if (selectedCategories.length > 0) {
          results = results.filter((doc: Record) =>
            selectedCategories.includes(doc.category)
          );
        }

        setFilteredRecords(results);
      } catch (error) {
        console.error("Search error:", error);
        setError("Search failed. Please try again.");
      } finally {
        setIsSearching(false);
      }
    },
    [records, selectedCategories]
  );

  // Category filter handler
  const handleCategoryChange = useCallback(
    (category: string, isSelected: boolean) => {
      setSelectedCategories((prev) => {
        const newCategories = isSelected
          ? [...prev, category]
          : prev.filter((c) => c !== category);
        setFilteredRecords(
          records.filter((record) => newCategories.includes(record.category))
        );
        return newCategories;
      });
    },
    [records]
  );

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24">
        <SearchBar onSearch={handleSearch} isSearching={isSearching} />
        <div className="flex">
          <Sidebar
            categories={Array.from(
              new Set(records.map((record) => record.category))
            ).map((category) => ({
              name: category,
              value: category,
            }))}
            selectedCategories={selectedCategories}
            onCategoryChange={handleCategoryChange}
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          <div
            className={`flex-1 transition-all duration-300 ${
              isSidebarOpen ? "ml-64" : "ml-0"
            }`}
          >
            {error ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-error/10 text-error text-center rounded-lg mx-6 mt-6"
              >
                {error}
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                {isSearching ? (
                  <GridSkeleton />
                ) : (
                  <DocumentGrid
                    documents={filteredRecords}
                    isLoading={isSearching}
                  />
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
