// components/Search/SearchBar.tsx
import { useCallback, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { debounce } from 'lodash';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isSearching?: boolean;
}

export const SearchBar = ({ onSearch, isSearching }: SearchBarProps) => {
  const [query, setQuery] = useState('');

  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      onSearch(searchQuery);
    }, 300),
    [onSearch]
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  return (
    <div className="fixed top-24 left-0 right-0 z-30 px-4 py-4 bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="max-w-3xl mx-auto relative">
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Search documents..."
          className="
            w-full px-4 py-3 pr-16
            bg-gray-50 border-0 rounded-lg
            focus:ring-2 focus:ring-primary focus:outline-none
            font-sans text-base text-gray-900
            placeholder-gray-500
            transition-all duration-200
          "
        />
        
          <motion.button
            className="absolute right-3 top-1/2 -translate-y-1/2"

            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }} /* 🔹 Loops the pulse smoothly */
            onClick={() => onSearch(query)}
          >
            <Image
              src="/logo.png"
              alt="Search"
              width={24}
              height={24}
              className="transition-opacity duration-200"
            />
          </motion.button>



        
      </div>
    </div>
  );
};
