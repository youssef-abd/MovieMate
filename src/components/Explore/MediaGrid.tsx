import React, { useState } from 'react';
import { Plus, Star, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { useDiscover } from '@/hooks/useTMDB';
import { getImageUrl } from '@/lib/tmdb';
import { MediaDetails } from '../Media/MediaDetails';
import type { MovieResult, TvResult } from '@/types/tmdb';

interface MediaGridProps {
  selectedGenres: number[];
}

export const MediaGrid = ({ selectedGenres }: MediaGridProps) => {
  const { results, loading, error } = useDiscover(selectedGenres);
  const [selectedMedia, setSelectedMedia] = useState<MovieResult | TvResult | null>(null);

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

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {results.map((item: MovieResult | TvResult) => (
          <div
            key={item.id}
            className="group relative cursor-pointer"
            onClick={() => setSelectedMedia(item)}
          >
            <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-200">
              <img
                src={getImageUrl(item.poster_path || '', 'w400')}
                alt={item.media_type === 'movie' ? item.title : item.name}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-white font-medium">
                      {(item.vote_average * 10).toFixed()}%
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" className="w-full">
                      <Plus className="h-4 w-4 mr-1" />
                      Watchlist
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {item.media_type === 'movie' ? item.title : item.name}
            </h3>
            <p className="text-sm text-gray-500">
              {new Date(
                item.media_type === 'movie' 
                  ? item.release_date 
                  : item.first_air_date
              ).getFullYear()}
            </p>
          </div>
        ))}
      </div>

      {selectedMedia && (
        <MediaDetails
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
        />
      )}
    </>
  );
};