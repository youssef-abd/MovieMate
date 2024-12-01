import  { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MovieResult } from '@/types/tmdb';
import { getTrending, getPopular, getTopRated } from '@/lib/tmdb';
import { MediaGrid } from '@/components/Media/MediaGrid';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export const MoviesPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<MovieResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        let data: MovieResult[];
        
        console.log('Fetching movies for category:', category); // Debug log
        
        switch (category) {
          case 'popular':
            data = await getPopular('movie') as MovieResult[];
            break;
          case 'top-rated':
            data = await getTopRated('movie') as MovieResult[];
            break;
          case undefined: // Base /movies route
            data = await getTrending('movie') as MovieResult[];
            break;
          default:
            navigate('/movies');
            return;
        }
        
        console.log('Fetched movies:', data); // Debug log
        setMovies(data);
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError('Failed to fetch movies. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [category, navigate]);

  const getPageTitle = () => {
    switch (category) {
      case 'popular':
        return 'Popular Movies';
      case 'top-rated':
        return 'Top Rated Movies';
      default:
        return 'Trending Movies';
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

  console.log('Rendering movies:', movies.length); // Debug log

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{getPageTitle()}</h1>
      <MediaGrid items={movies} type="movie" />
    </div>
  );
};
