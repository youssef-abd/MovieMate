import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Star, Heart, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { useDiscover } from '@/hooks/useTMDB';
import { getImageUrl } from '@/lib/tmdb';
import type { MovieResult, TvResult } from '@/types/tmdb';

interface MediaGridProps {
  selectedGenres: number[];
}

export const MediaGrid = ({ selectedGenres }: MediaGridProps) => {
  const { results, loading, error } = useDiscover(selectedGenres);

  if (loading && !results.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        Failed to load content
      </div>
    );
  }

  const getMediaPath = (item: MovieResult | TvResult) => {
    const mediaType = item.media_type === 'movie' ? 'movies' : 'tv-shows';
    return `/${mediaType}/details/${item.id}`;
  };

  const handleAddToWatchlist = (e: React.MouseEvent, item: MovieResult | TvResult) => {
    e.preventDefault(); // Prevent navigation
    // Add watchlist logic here
    console.log('Added to watchlist:', item.id);
  };

  const handleRate = (e: React.MouseEvent, item: MovieResult | TvResult) => {
    e.preventDefault(); // Prevent navigation
    // Add rating logic here
    console.log('Rate:', item.id);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {results.map((item: MovieResult | TvResult) => (
        <Link
          key={item.id}
          to={getMediaPath(item)}
          className="group relative block bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
        >
          <div className="aspect-[2/3] relative">
            <img
              src={getImageUrl(item.poster_path || '', 'w400')}
              alt={item.media_type === 'movie' ? item.title : item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/no-poster.png';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-white text-sm font-medium">
                      {item.vote_average ? (Math.round(item.vote_average * 10) / 10).toFixed(1) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => handleRate(e, item)}
                      className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                    >
                      <Star className="h-4 w-4 text-yellow-400" />
                    </button>
                    <button
                      onClick={(e) => handleAddToWatchlist(e, item)}
                      className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                    >
                      <Heart className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                </div>
                <h3 className="text-white font-semibold line-clamp-2">
                  {item.media_type === 'movie' ? item.title : item.name}
                </h3>
                <p className="text-gray-300 text-sm">
                  {new Date(
                    item.media_type === 'movie' 
                      ? item.release_date 
                      : item.first_air_date
                  ).getFullYear()}
                </p>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};