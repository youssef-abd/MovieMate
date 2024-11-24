
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import type { SearchResult } from '@/types/tmdb';
import { getImageUrl } from '@/lib/tmdb';

interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  error: Error | null;
}

export const SearchResults = ({ results, loading, error }: SearchResultsProps) => {
  if (error) {
    return (
      <div className="absolute mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-center text-red-500">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Failed to load results</span>
        </div>
      </div>
    );
  }

  if (loading && !results.length) {
    return (
      <div className="absolute mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex justify-center">
          <span className="text-gray-500">Searching...</span>
        </div>
      </div>
    );
  }

  if (!results.length) {
    return null;
  }

  return (
    <div className="absolute mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
      {results.map((result) => (
        <Link
          key={result.id}
          to={`/${result.media_type}/${result.id}`}
          className="flex items-center px-4 py-2 hover:bg-gray-50"
        >
          <img
            src={getImageUrl(result.poster_path || '', 'w200')}
            alt={result.media_type === 'movie' ? result.title : result.name}
            className="w-12 h-16 object-cover rounded bg-gray-200"
          />
          <div className="ml-3">
            <h4 className="font-medium text-gray-900">
              {result.media_type === 'movie' ? result.title : result.name}
            </h4>
            <p className="text-sm text-gray-500">
              {result.media_type === 'movie' ? 'Movie' : 'TV Series'} • {' '}
              {new Date(
                result.media_type === 'movie' 
                  ? result.release_date 
                  : result.first_air_date
              ).getFullYear()}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};