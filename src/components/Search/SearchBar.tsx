import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X, Loader2, Bookmark } from 'lucide-react';
import { searchMulti } from '@/lib/tmdb';
import { SearchResult } from '@/types/tmdb';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { Button } from '@/components/ui/Button';

export const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim()) {
        setLoading(true);
        try {
          const searchResults = await searchMulti(query);
          setResults(searchResults);
        } catch (error) {
          console.error('Search failed:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const handleWatchlistClick = async (e: React.MouseEvent, item: SearchResult) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;

    try {
      if (isInWatchlist(item.id)) {
        await removeFromWatchlist(item);
      } else {
        await addToWatchlist({
          ...item,
          media_type: item.media_type
        });
      }
    } catch (error) {
      console.error('Failed to update watchlist:', error);
    }
  };

  return (
    <div className="relative">
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
          className="w-full md:w-64 pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-purple-500"
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
              setResults([]);
            }}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full md:w-96 mt-2 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="py-2 max-h-96 overflow-y-auto">
            {results.map((result) => (
              <div
                key={result.id}
                className="flex items-center px-4 py-2 hover:bg-gray-50 group"
              >
                <Link
                  to={`/${result.media_type === 'movie' ? 'movies' : 'tv-shows'}/details/${result.id}`}
                  onClick={() => {
                    setIsOpen(false);
                    setQuery('');
                  }}
                  className="flex items-center flex-1"
                >
                  {result.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${result.poster_path}`}
                      alt={result.title || result.name}
                      className="w-12 h-18 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-18 bg-gray-200 rounded flex items-center justify-center">
                      <SearchIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="ml-4 flex-1">
                    <div className="font-medium text-gray-900">
                      {result.title || result.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {result.media_type.charAt(0).toUpperCase() + result.media_type.slice(1)} •{' '}
                      {result.media_type === 'movie'
                        ? result.release_date?.split('-')[0]
                        : result.first_air_date?.split('-')[0]}
                    </div>
                  </div>
                </Link>
                {user && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`ml-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                      isInWatchlist(result.id) ? 'text-purple-600' : ''
                    }`}
                    onClick={(e) => handleWatchlistClick(e, result)}
                  >
                    <Bookmark className={`w-4 h-4 ${isInWatchlist(result.id) ? 'fill-current' : ''}`} />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};