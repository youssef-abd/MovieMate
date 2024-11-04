import React, { useState } from 'react';
import { Search as SearchIcon, X, Loader2 } from 'lucide-react';
import { SearchResults } from './SearchResults';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useSearch } from '@/hooks/useTMDB';

export const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setIsOpen(false));
  const { results, loading, error } = useSearch(query);

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search movies, shows..."
          className="w-64 pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-purple-500"
        />
        {loading ? (
          <Loader2 className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 animate-spin" />
        ) : (
          <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        )}
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      {isOpen && (
        <SearchResults 
          results={results} 
          loading={loading} 
          error={error} 
        />
      )}
    </div>
  );
};