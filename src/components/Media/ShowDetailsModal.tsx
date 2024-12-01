import React, { useState, useEffect } from 'react';
import { X, Star, Calendar, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { getImageUrl } from '@/lib/tmdb';
import { LoadingSpinner } from '../LoadingSpinner';
import ReactDOM from 'react-dom';

interface ShowDetailsModalProps {
  showId: number;
  onClose: () => void;
}

interface Episode {
  id: number;
  name: string;
  overview: string;
  still_path: string;
  episode_number: number;
  air_date: string;
  runtime: number;
}

interface Season {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  season_number: number;
  episodes: Episode[];
}

interface ShowDetails {
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  vote_average: number;
  number_of_seasons: number;
  seasons: Season[];
  genres: { id: number; name: string }[];
  status: string;
}

export const ShowDetailsModal: React.FC<ShowDetailsModalProps> = ({ showId, onClose }) => {
  const [details, setDetails] = useState<ShowDetails | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShowDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://api.themoviedb.org/3/tv/${showId}?api_key=${import.meta.env.VITE_TMDB_API_KEY}&append_to_response=season/${selectedSeason}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch show details');
        }

        const data = await response.json();
        setDetails(data);

        // Fetch episodes for the selected season
        const seasonResponse = await fetch(
          `https://api.themoviedb.org/3/tv/${showId}/season/${selectedSeason}?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
        );
        
        if (!seasonResponse.ok) {
          throw new Error('Failed to fetch season details');
        }

        const seasonData = await seasonResponse.json();
        setDetails(prev => prev ? {
          ...prev,
          seasons: prev.seasons.map(season =>
            season.season_number === selectedSeason
              ? { ...season, episodes: seasonData.episodes }
              : season
          )
        } : null);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchShowDetails();
  }, [showId, selectedSeason]);

  if (loading) {
    return ReactDOM.createPortal(
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <LoadingSpinner />
        </div>
      </div>,
      document.body
    );
  }

  if (error || !details) {
    return ReactDOM.createPortal(
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <p className="text-red-500">{error || 'Failed to load show details'}</p>
          <Button onClick={onClose} className="mt-4">Close</Button>
        </div>
      </div>,
      document.body
    );
  }

  const currentSeason = details.seasons.find(s => s.season_number === selectedSeason);

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div className="absolute inset-0 overflow-y-auto">
        <div className="min-h-full py-8 px-4">
          <div className="relative w-full max-w-4xl mx-auto bg-white rounded-lg shadow-xl">
            <button
              onClick={handleClose}
              className="absolute -top-4 -right-4 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 z-50"
              aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Show Header */}
            <div className="relative">
              {details.backdrop_path && (
                <div className="w-full h-64 relative">
                  <img
                    src={getImageUrl(details.backdrop_path, 'original')}
                    alt={details.name}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                </div>
              )}
              <div className="absolute bottom-4 left-4 text-white">
                <h2 className="text-3xl font-bold">{details.name}</h2>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 mr-1" />
                    <span>{details.vote_average.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-1" />
                    <span>{new Date(details.first_air_date).getFullYear()}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="px-2 py-1 bg-purple-600 rounded-full text-sm">
                      {details.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Show Content */}
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Overview</h3>
                <p className="text-gray-600">{details.overview}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {details.genres.map(genre => (
                    <span
                      key={genre.id}
                      className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Season Selection */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">Seasons</h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {details.seasons.map(season => (
                    <button
                      key={season.id}
                      onClick={() => setSelectedSeason(season.season_number)}
                      className={`px-4 py-2 rounded-full whitespace-nowrap ${
                        selectedSeason === season.season_number
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {season.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Episodes List */}
              {currentSeason && currentSeason.episodes && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Episodes</h3>
                  <div className="space-y-4">
                    {currentSeason.episodes.map(episode => (
                      <div
                        key={episode.id}
                        className="flex gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                      >
                        {episode.still_path ? (
                          <img
                            src={getImageUrl(episode.still_path, 'w400')}
                            alt={episode.name}
                            className="w-40 h-24 object-cover rounded"
                          />
                        ) : (
                          <div className="w-40 h-24 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-gray-400">No Image</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">
                              Episode {episode.episode_number}: {episode.name}
                            </h4>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>{episode.runtime} min</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">{episode.overview}</p>
                          <div className="mt-2 text-sm text-gray-500">
                            Air Date: {new Date(episode.air_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};
