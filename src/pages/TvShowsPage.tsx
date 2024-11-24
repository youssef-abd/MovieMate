import  { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TvResult } from '@/types/tmdb';
import { getTrending, getPopular, getTopRated } from '@/lib/tmdb';
import { MediaGrid } from '@/components/Media/MediaGrid';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export const TvShowsPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [shows, setShows] = useState<TvResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShows = async () => {
      try {
        setLoading(true);
        setError(null);
        let data: TvResult[];
        
        switch (category) {
          case 'popular':
            data = await getPopular('tv') as TvResult[];
            break;
          case 'top-rated':
            data = await getTopRated('tv') as TvResult[];
            break;
          case undefined: // Base /tv-shows route
            data = await getTrending('tv') as TvResult[];
            break;
          default:
            navigate('/tv-shows');
            return;
        }
        
        setShows(data);
      } catch (err) {
        setError('Failed to fetch TV shows. Please try again later.');
        console.error('Error fetching TV shows:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShows();
  }, [category, navigate]);

  const getPageTitle = () => {
    switch (category) {
      case 'popular':
        return 'Popular TV Shows';
      case 'top-rated':
        return 'Top Rated TV Shows';
      default:
        return 'Trending TV Shows';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{getPageTitle()}</h1>
      <MediaGrid items={shows} />
    </div>
  );
};
