import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { addRating, removeRating, getRating } from '@/lib/ratings';
import type { MovieResult, TvResult } from '@/types/tmdb';

interface RatingButtonProps {
  media: MovieResult | TvResult;
  size?: 'sm' | 'md' | 'lg';
  onRate?: (rating: number) => void;
}

export const RatingButton: React.FC<RatingButtonProps> = ({ media, size = 'md', onRate }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadRating = async () => {
      if (!user) return;
      try {
        const currentRating = await getRating(user.uid, media.id);
        setRating(currentRating);
      } catch (error) {
        console.error('Error loading rating:', error);
      }
    };

    loadRating();
  }, [user, media.id]);

  const handleRate = async (newRating: number) => {
    if (!user) return;
    
    setLoading(true);
    try {
      if (rating === newRating) {
        await removeRating(user.uid, media.id);
        setRating(null);
      } else {
        await addRating(user.uid, media.id, {
          mediaId: media.id,
          mediaType: 'title' in media ? 'movie' : 'tv',
          rating: newRating,
          title: 'title' in media ? media.title : media.name,
          posterPath: media.poster_path,
          voteAverage: media.vote_average,
          releaseDate: 'release_date' in media ? media.release_date : media.first_air_date,
          ratedAt: new Date()
        });
        setRating(newRating);
      }
      onRate?.(newRating);
    } catch (error) {
      console.error('Error rating media:', error);
    } finally {
      setLoading(false);
    }
  };

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const containerSizes = {
    sm: 'gap-1',
    md: 'gap-1.5',
    lg: 'gap-2'
  };

  return (
    <div className={`flex items-center ${containerSizes[size]}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          disabled={loading || !user}
          onClick={() => handleRate(star)}
          onMouseEnter={() => setHoveredRating(star)}
          onMouseLeave={() => setHoveredRating(null)}
          className={`focus:outline-none transition-colors ${!user ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        >
          <Star
            className={`${starSizes[size]} ${
              (hoveredRating !== null ? star <= hoveredRating : star <= (rating || 0))
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
};
