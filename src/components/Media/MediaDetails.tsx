import  { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MovieResult, TvResult } from '@/types/tmdb';
import { getImageUrl } from '@/lib/tmdb';
import { LoadingSpinner } from '../LoadingSpinner';
import { X, Bookmark, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { Button } from '../ui/Button';
import { EpisodeList } from './EpisodeList'; // Import EpisodeList component
import { WatchlistCategory } from '@/contexts/WatchlistContext';

interface MediaDetailsProps {
  type: 'movie' | 'tv' | 'anime';
  mediaId?: number;
  onClose?: () => void;
}

const API_KEY = '3412e48ff7d285be9bf4f044ad8d4a6c';

export const MediaDetails = ({ type, mediaId, onClose }: MediaDetailsProps) => {
  const params = useParams();
  const id = mediaId || params.id;
  const [details, setDetails] = useState<MovieResult | TvResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [showWatchlistMenu, setShowWatchlistMenu] = useState(false);
  const [watchlistMenuPosition, setWatchlistMenuPosition] = useState({ x: 0, y: 0 });
  const { user } = useAuth();
  const { 
    isInWatchlist, 
    addToWatchlist, 
    removeFromWatchlist, 
    getRating, 
    rateMedia, 
    getItemCategory, 
    moveToCategory, 
    customWatchlists, 
    isInCustomWatchlist, 
    addToCustomWatchlist, 
    removeFromCustomWatchlist 
  } = useWatchlist();

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);

        const mediaType = type === 'anime' ? 'tv' : type;
        const response = await fetch(
          `https://api.themoviedb.org/3/${mediaType}/${id}?api_key=${API_KEY}&language=en-US`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch details');
        }

        const data = await response.json();
        setDetails(data);
      } catch (err) {
        setError('Failed to load details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, type]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  if (!id) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
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

            {loading ? (
              <div className="p-8 flex justify-center items-center">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-500">{error}</p>
                <button
                  onClick={handleClose}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Go Back
                </button>
              </div>
            ) : details ? (
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/3">
                  <div className="aspect-[2/3] relative">
                    <img
                      src={getImageUrl(details.poster_path, 'w500')}
                      alt={'title' in details ? details.title : details.name}
                      className="w-full h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/no-poster.png';
                      }}
                    />
                  </div>
                </div>

                <div className="p-6 flex-1">
                  <h1 className="text-3xl font-bold mb-4">
                    {'title' in details ? details.title : details.name}
                    {('release_date' in details ? details.release_date : details.first_air_date) && (
                      <span className="text-gray-500 ml-2">
                        ({new Date('release_date' in details ? details.release_date : details.first_air_date || '').getFullYear()})
                      </span>
                    )}
                  </h1>

                  {details.vote_average && (
                    <div className="flex items-center mb-4">
                      <svg
                        className="w-6 h-6 text-yellow-400 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xl font-semibold">
                        {Math.round(details.vote_average * 10) / 10}
                      </span>
                      <span className="text-gray-500 ml-2">/ 10</span>
                    </div>
                  )}

                  {user && (
                    <div className="flex gap-4 mb-6">
                      <div className="relative">
                        <Button
                          variant="secondary"
                          size="lg"
                          className={`flex items-center gap-2 ${isInWatchlist(details.id) ? 'bg-purple-600 text-white' : ''}`}
                          onClick={(e) => {
                            const buttonRect = e.currentTarget.getBoundingClientRect();
                            setWatchlistMenuPosition({ x: buttonRect.left, y: buttonRect.bottom });
                            setShowWatchlistMenu(!showWatchlistMenu);
                          }}
                        >
                          <Bookmark className="w-5 h-5" />
                          {isInWatchlist(details.id) ? getItemCategory(details.id)?.replace(/_/g, ' ').toUpperCase() : 'Add to Watchlist'}
                        </Button>
                        
                        {showWatchlistMenu && (
                          <div 
                            className="absolute z-50 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                            style={{ top: watchlistMenuPosition.y, left: watchlistMenuPosition.x }}
                          >
                            <div className="py-1" role="menu" aria-orientation="vertical">
                              {/* Default Categories */}
                              <div className="px-3 py-2 text-xs text-gray-500 font-medium">Default Lists</div>
                              {['plan_to_watch', 'watching', 'completed', 'dropped'].map((category) => (
                                <button
                                  key={category}
                                  className={`w-full text-left px-4 py-2 text-sm ${
                                    getItemCategory(details.id) === category
                                      ? 'bg-purple-50 text-purple-700'
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                  onClick={async () => {
                                    const mediaType = type === 'anime' ? 'tv' : type;
                                    if (isInWatchlist(details.id)) {
                                      await moveToCategory(details.id, category as WatchlistCategory);
                                    } else {
                                      await addToWatchlist({
                                        ...details,
                                        media_type: mediaType
                                      }, category as WatchlistCategory);
                                    }
                                    setShowWatchlistMenu(false);
                                  }}
                                >
                                  {category.replace(/_/g, ' ').toUpperCase()}
                                </button>
                              ))}

                              {/* Custom Watchlists */}
                              {customWatchlists.length > 0 && (
                                <>
                                  <div className="border-t border-gray-100 mt-2" />
                                  <div className="px-3 py-2 text-xs text-gray-500 font-medium">Custom Lists</div>
                                  {customWatchlists.map((watchlist) => (
                                    <button
                                      key={watchlist.id}
                                      className={`w-full text-left px-4 py-2 text-sm ${
                                        isInCustomWatchlist(watchlist.id, details.id)
                                          ? 'bg-purple-50 text-purple-700'
                                          : 'text-gray-700 hover:bg-gray-50'
                                      }`}
                                      onClick={async () => {
                                        const mediaType = type === 'anime' ? 'tv' : type;
                                        if (isInCustomWatchlist(watchlist.id, details.id)) {
                                          await removeFromCustomWatchlist(watchlist.id, details.id);
                                        } else {
                                          await addToCustomWatchlist(watchlist.id, {
                                            ...details,
                                            media_type: mediaType
                                          });
                                        }
                                        setShowWatchlistMenu(false);
                                      }}
                                    >
                                      {watchlist.name}
                                    </button>
                                  ))}
                                </>
                              )}

                              {/* Remove from all lists */}
                              {isInWatchlist(details.id) && (
                                <>
                                  <div className="border-t border-gray-100 mt-2" />
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                                    onClick={async () => {
                                      await removeFromWatchlist(details.id);
                                      setShowWatchlistMenu(false);
                                    }}
                                  >
                                    Remove from Watchlist
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="relative">
                        <Button
                          variant="secondary"
                          size="lg"
                          className={`flex items-center gap-2 ${getRating(details.id.toString()) ? 'bg-purple-600 text-white' : ''}`}
                          onClick={() => setShowRating(!showRating)}
                        >
                          <Star className="w-5 h-5" />
                          {getRating(details.id.toString()) ? `Rated ${getRating(details.id.toString())}★` : 'Rate'}
                        </Button>
                        {showRating && (
                          <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg p-2 flex gap-1 z-50">
                            {[1, 2, 3, 4, 5].map((stars) => (
                              <button
                                key={stars}
                                className="p-2 hover:text-yellow-400"
                                onClick={() => {
                                  rateMedia(details.id.toString(), stars);
                                  setShowRating(false);
                                }}
                              >
                                <Star
                                  className={`w-6 h-6 ${getRating(details.id.toString()) && getRating(details.id.toString()) >= stars ? 'text-yellow-400 fill-current' : ''}`}
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <p className="text-gray-700 mb-6">{details.overview}</p>

                  <div className="space-y-4">
                    {'release_date' in details && details.release_date && (
                      <div>
                        <span className="font-semibold">Release Date:</span>{' '}
                        {new Date(details.release_date).toLocaleDateString()}
                      </div>
                    )}
                    {'first_air_date' in details && details.first_air_date && (
                      <div>
                        <span className="font-semibold">First Air Date:</span>{' '}
                        {new Date(details.first_air_date).toLocaleDateString()}
                      </div>
                    )}
                    <div>
                      <span className="font-semibold">Original Language:</span>{' '}
                      {details.original_language?.toUpperCase()}
                    </div>
                    {'runtime' in details && details.runtime && (
                      <div>
                        <span className="font-semibold">Runtime:</span>{' '}
                        {details.runtime} minutes
                      </div>
                    )}
                    {'number_of_seasons' in details && details.number_of_seasons && (
                      <div>
                        <span className="font-semibold">Seasons:</span>{' '}
                        {details.number_of_seasons}
                      </div>
                    )}
                  </div>

                  {details && (type === 'tv' || type === 'anime') && (
                    <div className="mt-8">
                      <h2 className="text-2xl font-bold mb-4">Episodes</h2>
                      <EpisodeList mediaId={details.id} mediaType={type} />
                    </div>
                  )}
                </div>
              </div>
            ) : <></>}
          </div>
        </div>
      </div>
    </div>
  );
};