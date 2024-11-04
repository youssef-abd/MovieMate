import React, { useState } from 'react';
import { Star, Plus, Minus, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from '@/lib/watchlist';
import { rateMedia, getUserRating } from '@/lib/ratings';
import { getImageUrl } from '@/lib/tmdb';
import type { MovieResult, TvResult } from '@/types/tmdb';

interface MediaDetailsProps {
  media: MovieResult | TvResult;
  onClose: () => void;
}

export const MediaDetails = ({ media, onClose }: MediaDetailsProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState<number | null>(null);
  const [inWatchlist, setInWatchlist] = useState(false);

  React.useEffect(() => {
    if (user) {
      isInWatchlist(user.uid, media.id).then(setInWatchlist);
      getUserRating(user.uid, media.id).then(rating => {
        if (rating) setRating(rating.rating);
      });
    }
  }, [user, media.id]);

  const handleRating = async (value: number) => {
    if (!user) return;
    
    await rateMedia(user.uid, media.id, media.media_type, value);
    setRating(value);
  };

  const toggleWatchlist = async () => {
    if (!user) return;

    if (inWatchlist) {
      await removeFromWatchlist(user.uid, media.id);
    } else {
      await addToWatchlist(user.uid, media);
    }
    setInWatchlist(!inWatchlist);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/3">
            <img
              src={getImageUrl(media.poster_path || '', 'w500')}
              alt={media.media_type === 'movie' ? media.title : media.name}
              className="w-full h-full object-cover rounded-l-lg"
            />
          </div>

          <div className="p-6 flex-1">
            <h2 className="text-2xl font-bold">
              {media.media_type === 'movie' ? media.title : media.name}
            </h2>
            
            <div className="mt-4 flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="font-medium">
                {(media.vote_average * 10).toFixed()}%
              </span>
              <span className="text-gray-500">
                ({media.vote_count.toLocaleString()} votes)
              </span>
            </div>

            <p className="mt-4 text-gray-600">{media.overview}</p>

            <div className="mt-6 space-y-4">
              <div>
                <h3 className="font-medium mb-2">Your Rating</h3>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => handleRating(value)}
                      className={`p-2 rounded-full ${
                        rating === value
                          ? 'bg-yellow-400 text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <Star className={`w-6 h-6 ${rating === value ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={toggleWatchlist}
                className="w-full sm:w-auto"
              >
                {inWatchlist ? (
                  <>
                    <Minus className="w-4 h-4 mr-2" />
                    Remove from Watchlist
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Watchlist
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};