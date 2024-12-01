import { MovieResult, TvResult, SearchResult } from '@/types/tmdb';

const TMDB_API_KEY = '3412e48ff7d285be9bf4f044ad8d4a6c';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const searchParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    ...params,
  });

  const response = await fetch(`${BASE_URL}${endpoint}?${searchParams}`);
  if (!response.ok) throw new Error('TMDB API request failed');
  
  return response.json();
}

export function getImageUrl(path: string, size: 'w200' | 'w400' | 'w500' | 'original' = 'w500'): string {
  return path ? `${IMAGE_BASE_URL}/${size}${path}` : '';
}

export async function searchMulti(query: string): Promise<SearchResult[]> {
  const data = await fetchTMDB<{ results: SearchResult[] }>('/search/multi', {
    query,
    include_adult: 'false',
  });
  return data.results;
}

export async function getTrending(type: 'movie' | 'tv'): Promise<(MovieResult | TvResult)[]> {
  const data = await fetchTMDB<{ results: (MovieResult | TvResult)[] }>(`/trending/${type}/week`);
  return data.results.map(item => ({ ...item, media_type: type } as MovieResult | TvResult));
}

export async function getPopular(type: 'movie' | 'tv'): Promise<(MovieResult | TvResult)[]> {
  const data = await fetchTMDB<{ results: (MovieResult | TvResult)[] }>(`/${type}/popular`);
  return data.results.map(item => ({ ...item, media_type: type } as MovieResult | TvResult));
}

export async function getTopRated(type: 'movie' | 'tv'): Promise<(MovieResult | TvResult)[]> {
  const data = await fetchTMDB<{ results: (MovieResult | TvResult)[] }>(`/${type}/top_rated`);
  return data.results.map(item => ({ ...item, media_type: type } as MovieResult | TvResult));
}

export async function getGenres(): Promise<{ id: number; name: string; }[]> {
  const [movieGenres, tvGenres] = await Promise.all([
    fetchTMDB<{ genres: { id: number; name: string; }[] }>('/genre/movie/list'),
    fetchTMDB<{ genres: { id: number; name: string; }[] }>('/genre/tv/list'),
  ]);

  // Combine and deduplicate genres
  const genres = [...movieGenres.genres, ...tvGenres.genres];
  const uniqueGenres = Array.from(
    new Map(genres.map(genre => [genre.id, genre])).values()
  );

  return uniqueGenres;
}

export async function discoverByGenres(genreIds: number[]): Promise<(MovieResult | TvResult)[]> {
  const [movies, tvShows] = await Promise.all([
    fetchTMDB<{ results: MovieResult[] }>('/discover/movie', {
      with_genres: genreIds.join(','),
      sort_by: 'popularity.desc',
    }),
    fetchTMDB<{ results: TvResult[] }>('/discover/tv', {
      with_genres: genreIds.join(','),
      sort_by: 'popularity.desc',
    }),
  ]);

  const combinedResults = [
    ...movies.results.map(movie => ({ ...movie, media_type: 'movie' as const })),
    ...tvShows.results.map(show => ({ ...show, media_type: 'tv' as const })),
  ];

  return combinedResults.sort((a, b) => b.popularity - a.popularity).slice(0, 20);
}