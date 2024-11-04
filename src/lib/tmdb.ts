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
  const data = await fetchTMDB<{ results: SearchResult[] }>('/search/multi', { query });
  return data.results.filter(item => 
    item.media_type === 'movie' || 
    item.media_type === 'tv'
  ).slice(0, 5);
}

export async function getTrending(): Promise<(MovieResult | TvResult)[]> {
  const data = await fetchTMDB<{ results: (MovieResult | TvResult)[] }>('/trending/all/week');
  return data.results;
}

export async function getGenres(): Promise<{ id: number; name: string; }[]> {
  const [movies, tv] = await Promise.all([
    fetchTMDB<{ genres: { id: number; name: string; }[] }>('/genre/movie/list'),
    fetchTMDB<{ genres: { id: number; name: string; }[] }>('/genre/tv/list'),
  ]);

  const uniqueGenres = new Map();
  [...movies.genres, ...tv.genres].forEach(genre => {
    uniqueGenres.set(genre.id, genre);
  });

  return Array.from(uniqueGenres.values());
}

export async function discoverByGenres(genreIds: number[]): Promise<(MovieResult | TvResult)[]> {
  if (!genreIds.length) return getTrending();

  const [movies, tv] = await Promise.all([
    fetchTMDB<{ results: MovieResult[] }>('/discover/movie', {
      with_genres: genreIds.join(','),
      sort_by: 'popularity.desc',
    }),
    fetchTMDB<{ results: TvResult[] }>('/discover/tv', {
      with_genres: genreIds.join(','),
      sort_by: 'popularity.desc',
    }),
  ]);

  return [...movies.results, ...tv.results]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 20);
}