export interface BaseResult {
  id: number;
  genre_ids: number[];
  overview: string;
  popularity: number;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
}

export interface MovieResult extends BaseResult {
  media_type: 'movie';
  title: string;
  release_date: string;
}

export interface TvResult extends BaseResult {
  media_type: 'tv';
  name: string;
  first_air_date: string;
}

export type SearchResult = MovieResult | TvResult;