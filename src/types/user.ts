export type UserPrivacySettings = {
  profileVisibility: 'public' | 'private' | 'friends';
  showWatchlist: boolean;
  showRatings: boolean;
  showReviews: boolean;
  showFollowers: boolean;
};

export type UserProfile = {
  uid: string;
  username: string;
  displayName: string;
  photoURL: string | null;
  bio: string;
  favoriteGenres: string[];
  favoriteDirectors: string[];
  joinDate: string;
  privacySettings: UserPrivacySettings;
  followers: string[];
  following: string[];
  stats: {
    totalMoviesWatched: number;
    totalTvShowsWatched: number;
    averageRating: number;
    totalReviews: number;
  };
};

export type UserSearchResult = {
  uid: string;
  username: string;
  displayName: string;
  photoURL: string | null;
  bio: string;
  sharedInterests: {
    genres: string[];
    directors: string[];
    movies: number;
  };
  mutualFollowers: number;
};
