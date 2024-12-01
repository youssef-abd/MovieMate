import { Loader2 } from 'lucide-react';
import { useDiscover } from '@/hooks/useTMDB';
import type { MovieResult, TvResult } from '@/types/tmdb';
import { MediaCard } from '../Media/MediaCard';

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

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {results.map((item: MovieResult | TvResult) => (
        <MediaCard
          key={item.id}
          item={item}
          type={item.media_type}
        />
      ))}
    </div>
  );
};