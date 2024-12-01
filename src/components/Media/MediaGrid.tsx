
import { MovieResult, TvResult } from '@/types/tmdb';
import { MediaCard } from './MediaCard';

interface MediaGridProps {
  items: (MovieResult | TvResult)[];
  type?: 'movie' | 'tv' | 'anime';
}

export const MediaGrid = ({ items, type }: MediaGridProps) => {
  console.log('MediaGrid rendering with type:', type, 'and items:', items.length); // Debug log

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {items.map((item) => {
        console.log('Rendering MediaCard for item:', item.id); // Debug log
        return (
          <MediaCard 
            key={item.id} 
            item={item} 
            type={type || ('title' in item ? 'movie' : 'tv')} 
          />
        );
      })}
    </div>
  );
};
