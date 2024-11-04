import React from 'react';
import { Star, Calendar, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getWatchlist, removeFromWatchlist } from '@/lib/watchlist';
import { getImageUrl } from '@/lib/tmdb';
import { Button } from '@/components/ui/Button';

export const WatchlistPage = () => {
  const { user } = useAuth();
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchWatchlist = async () => {
      if (!user) return;
      try {
        const data = await getWatchlist(user.uid);
        setItems(data);
      } catch (error) {
        console.error('Error fetching watchlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [user]);

  const handleRemove = async (mediaId: number) => {
    if (!user) return;
    try {
      await removeFromWatchlist(user.uid, mediaId);
      setItems(items.filter(item => item.id !== mediaId));
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 px-4">
        <div className="max-w-7xl mx-auto text-center py-12">
          <h2 className="text-3xl font-bold text-gray-900">Sign in to view your watchlist</h2>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4">
      <div className="max-w-7xl mx-auto py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Watchlist</h1>
        
        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Your watchlist is empty</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="flex">
                  <img
                    src={getImageUrl(item.posterPath, 'w200')}
                    alt={item.title}
                    className="w-32 object-cover"
                  />
                  <div className="p-4 flex-1">
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                        {(item.voteAverage * 10).toFixed()}%
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(item.releaseDate).getFullYear()}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(item.id)}
                      className="mt-4 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};