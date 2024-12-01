import React, { useState, useEffect } from 'react';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWatchlist } from '@/contexts/WatchlistContext';


interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  air_date: string;
  vote_average: number;
}

interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  episodes: Episode[];
}

interface EpisodeListProps {
  mediaId: number;
  mediaType: 'tv' | 'anime';
}

const API_KEY = '3412e48ff7d285be9bf4f044ad8d4a6c';

export const EpisodeList: React.FC<EpisodeListProps> = ({ mediaId, mediaType }) => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSeasons, setExpandedSeasons] = useState<number[]>([]);
  const { user } = useAuth();
  const { rateMedia, getRating } = useWatchlist();

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://api.themoviedb.org/3/${mediaType === 'anime' ? 'tv' : mediaType}/${mediaId}?api_key=${API_KEY}&append_to_response=season/1,season/2,season/3,season/4,season/5`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch seasons');
        }

        const data = await response.json();
        const seasonsData: Season[] = [];

        // Process each season
        for (let i = 1; i <= data.number_of_seasons; i++) {
          const seasonResponse = await fetch(
            `https://api.themoviedb.org/3/${mediaType === 'anime' ? 'tv' : mediaType}/${mediaId}/season/${i}?api_key=${API_KEY}`
          );
          if (seasonResponse.ok) {
            const seasonData = await seasonResponse.json();
            seasonsData.push(seasonData);
          }
        }

        setSeasons(seasonsData);
        // Expand first season by default
        if (seasonsData.length > 0) {
          setExpandedSeasons([seasonsData[0].season_number]);
        }
      } catch (err) {
        setError('Failed to load episodes. Please try again later.');
        console.error('Error fetching episodes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSeasons();
  }, [mediaId]);

  const toggleSeason = (seasonNumber: number) => {
    setExpandedSeasons(prev =>
      prev.includes(seasonNumber)
        ? prev.filter(num => num !== seasonNumber)
        : [...prev, seasonNumber]
    );
  };

  const handleRating = async (episodeId: string, rating: number) => {
    if (!user) return;
    await rateMedia(episodeId, rating);
  };

  if (loading) {
    return <div className="flex justify-center p-4">Loading episodes...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="space-y-4">
      {seasons.map((season) => (
        <div key={season.id} className="border rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSeason(season.season_number)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100"
          >
            <h3 className="text-lg font-semibold">{season.name}</h3>
            {expandedSeasons.includes(season.season_number) ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
          
          {expandedSeasons.includes(season.season_number) && (
            <div className="divide-y">
              {season.episodes.map((episode) => {
                const episodeId = `${mediaId}_s${season.season_number}e${episode.episode_number}`;
                const userRating = getRating(episodeId);

                return (
                  <div key={episode.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">
                          Episode {episode.episode_number}: {episode.name}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">{episode.overview}</p>
                        <div className="mt-2 text-sm text-gray-500">
                          Air Date: {new Date(episode.air_date).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {user && (
                        <div className="ml-4 flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((stars) => (
                            <button
                              key={stars}
                              onClick={() => handleRating(episodeId, stars)}
                              className="p-1 hover:scale-110 transition-transform"
                            >
                              <Star
                                className={`w-5 h-5 ${
                                  userRating && userRating >= stars
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
