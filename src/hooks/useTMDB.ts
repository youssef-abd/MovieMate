import { useState, useEffect } from 'react';
import * as tmdb from '@/lib/tmdb';
import type { SearchResult, MovieResult, TvResult } from '@/types/tmdb';

export function useSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await tmdb.searchMulti(query);
        setResults(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Search failed'));
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchResults, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return { results, loading, error };
}

export function useDiscover(genreIds: number[]) {
  const [results, setResults] = useState<(MovieResult | TvResult)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await tmdb.discoverByGenres(genreIds);
        setResults(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Discovery failed'));
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [genreIds.join(',')]);

  return { results, loading, error };
}

export function useGenres() {
  const [genres, setGenres] = useState<{ id: number; name: string; }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await tmdb.getGenres();
        setGenres(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch genres'));
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  return { genres, loading, error };
}