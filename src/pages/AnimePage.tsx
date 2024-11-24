import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TvResult } from '@/types/tmdb';
import { MediaCard } from '@/components/Media/MediaCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export const AnimePage = () => {
  const { category } = useParams();
  const [anime, setAnime] = useState<TvResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        setLoading(true);
        setError(null);

        let endpoint = '';
        switch (category) {
          case 'popular':
            endpoint = 'https://api.themoviedb.org/3/discover/tv?api_key=3412e48ff7d285be9bf4f044ad8d4a6c&with_keywords=210024&sort_by=popularity.desc';
            break;
          case 'top-rated':
            endpoint = 'https://api.themoviedb.org/3/discover/tv?api_key=3412e48ff7d285be9bf4f044ad8d4a6c&with_keywords=210024&sort_by=vote_average.desc&vote_count.gte=100';
            break;
          default:
            endpoint = 'https://api.themoviedb.org/3/discover/tv?api_key=3412e48ff7d285be9bf4f044ad8d4a6c&with_keywords=210024';
        }

        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error('Failed to fetch anime');
        }

        const data = await response.json();
        setAnime(data.results);
      } catch (err) {
        setError('Failed to load anime. Please try again later.');
        console.error('Error fetching anime:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
  }, [category]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const pageTitle = category
    ? `${category.charAt(0).toUpperCase() + category.slice(1)} Anime`
    : 'All Anime';

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-8">{pageTitle}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {anime.map((item) => (
          <MediaCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};
