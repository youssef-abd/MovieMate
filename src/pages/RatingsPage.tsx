import React from 'react';
import { Star, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserRatings } from '@/lib/ratings';
import { getImageUrl } from '@/lib/tmdb';

export const RatingsPage = () => {
  const { user } = useAuth();
  const [ratings, setRatings] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchRatings = async () => {
      if (!user) return;
      try {
        const data = await getUserRatings(user.uid);
        setRatings(data);
      } catch (error) {
        console.error('Error fetching ratings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 px-4">
        <div className="max-w-7xl mx-auto text-center py-12">
          <h2 className="text-3xl font-bold text-gray-900">Sign in to view your ratings</h2>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Ratings</h1>
        
        {ratings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">You haven't rated any movies or shows yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ratings.map((rating) => (
              <div key={rating.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="flex">
                  <img
                    src={getImageUrl(rating.posterPath, 'w200')}
                    alt={rating.title}
                    className="w-32 object-cover"
                  />
                  <div className="p-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{rating.title}</h3>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < rating.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Rated on {new Date(rating.ratedAt?.toDate()).toLocaleDateString()}
                    </div>
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