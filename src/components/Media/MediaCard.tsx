import React, { useState } from 'react';
import { MovieResult, TvResult } from '@/types/tmdb';
import { getImageUrl } from '@/lib/tmdb';
import { Bookmark, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWatchlist, WatchlistCategory } from '@/contexts/WatchlistContext';
import { Button } from '../ui/Button';
import { MediaDetails } from './MediaDetails';

interface MediaCardProps {
  item: MovieResult | TvResult;
  showType?: boolean;
  type?: 'movie' | 'tv' | 'anime';
  size?: 'normal' | 'small';
}

export const MediaCard = ({ item, type, size = 'normal' }: MediaCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { user } = useAuth();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, rateMedia, getRating } = useWatchlist();
  const [showRating, setShowRating] = useState(false);

  const getTitle = (item: MovieResult | TvResult) => {
    if ('title' in item) return item.title;
    return item.name;
  };

  const releaseDate = 'release_date' in item ? item.release_date : item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
  const rating = item.vote_average ? Math.round(item.vote_average * 10) / 10 : null;
  
  const mediaType = type || ('title' in item ? 'movie' : 'tv');
  const isInWatchlistAlready = isInWatchlist(item.id);
  const userRating = getRating(item.id.toString());

  const handleWatchlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    const mediaItem = {
      ...item,
      poster_path: item.poster_path || undefined
    };

    if (isInWatchlistAlready) {
      await removeFromWatchlist(item.id);
    } else {
      await addToWatchlist(mediaItem, mediaType as WatchlistCategory);
    }
  };

  const handleRatingClick = async (e: React.MouseEvent, stars: number) => {
    e.stopPropagation();
    if (!user) return;
    await rateMedia(item.id.toString(), stars);
    setShowRating(false);
  };

  return (
    <>
      <div 
        onClick={() => setShowDetails(true)}
        className={`relative block bg-white rounded-lg shadow-sm overflow-hidden transition-transform hover:scale-105 cursor-pointer ${
          size === 'small' ? 'max-w-[140px]' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setShowRating(false);
        }}
      >
        <div className="relative aspect-[2/3] w-full">
          <img
            src={getImageUrl(item.poster_path || '', 'w400')}
            alt={getTitle(item) ?? 'Media Item'}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/no-poster.png';
            }}
          />
          {rating && (
            <div className={`absolute top-1 right-1 bg-black/75 text-white px-1.5 py-0.5 rounded-full ${size === 'small' ? 'text-xs' : 'text-sm'} flex items-center`}>
              <svg
                className={`${size === 'small' ? 'w-3 h-3' : 'w-4 h-4'} text-yellow-400 mr-0.5`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>{rating}</span>
            </div>
          )}

          {/* Watchlist and Rating Buttons */}
          {isHovered && user && (
            <div className={`absolute bottom-1 left-1 right-1 flex gap-1 ${size === 'small' ? 'flex-col' : ''}`}>
              <Button
                variant="secondary"
                size="sm"
                className={`flex items-center gap-1 ${isInWatchlistAlready ? 'bg-purple-600 text-white' : 'bg-white/90'} ${
                  size === 'small' ? 'text-xs px-2 py-0.5' : ''
                }`}
                onClick={handleWatchlistClick}
              >
                <Bookmark className={size === 'small' ? 'w-3 h-3' : 'w-4 h-4'} />
                {isInWatchlistAlready ? 'Saved' : 'Save'}
              </Button>
              <div className="relative">
                <Button
                  variant="secondary"
                  size="sm"
                  className={`flex items-center gap-1 ${userRating ? 'bg-purple-600 text-white' : 'bg-white/90'} ${
                    size === 'small' ? 'text-xs px-2 py-0.5' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRating(!showRating);
                  }}
                >
                  <Star className={size === 'small' ? 'w-3 h-3' : 'w-4 h-4'} />
                  {userRating ? userRating : 'Rate'}
                </Button>
                {showRating && (
                  <div className={`absolute bottom-full left-0 mb-1 bg-white rounded-lg shadow-lg p-1 flex gap-0.5 ${
                    size === 'small' ? 'scale-75 -translate-x-2' : ''
                  }`}>
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <button
                        key={stars}
                        className="p-0.5 hover:text-yellow-400"
                        onClick={(e) => handleRatingClick(e, stars)}
                      >
                        <Star
                          className={`w-4 h-4 ${userRating && userRating >= stars ? 'text-yellow-400 fill-current' : ''}`}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {size !== 'small' && (
          <div className="p-4">
            <h3 className="font-semibold text-lg line-clamp-2">{getTitle(item)}</h3>
            <div className="mt-2 text-sm text-gray-600">
              <span>{year}</span>
            </div>
          </div>
        )}
      </div>

      {showDetails && (
        <MediaDetails
          type={mediaType}
          mediaId={item.id}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
};
