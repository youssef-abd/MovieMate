import React, { useState } from 'react';
import { Star, Calendar, Trash2, Loader2, Plus, X, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { getImageUrl } from '@/lib/tmdb';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { WatchlistCategory } from '@/contexts/WatchlistContext';
import { MediaCard } from '@/components/Media/MediaCard';

export const WatchlistPage = () => {
  const { user } = useAuth();
  const {
    watchlists,
    customWatchlists,
    removeFromWatchlist,
    moveToCategory,
    createCustomWatchlist,
    deleteCustomWatchlist,
    removeFromCustomWatchlist,
  } = useWatchlist();

  const [loading, setLoading] = React.useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [showNewWatchlistInput, setShowNewWatchlistInput] = useState(false);

  const handleCreateCustomWatchlist = async () => {
    if (newWatchlistName.trim()) {
      await createCustomWatchlist(newWatchlistName.trim());
      setNewWatchlistName('');
      setShowNewWatchlistInput(false);
    }
  };

  const categories: { [key in WatchlistCategory]: string } = {
    plan_to_watch: 'Plan to Watch',
    watching: 'Watching',
    completed: 'Completed',
    dropped: 'Dropped',
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 px-4">
        <div className="max-w-7xl mx-auto text-center py-12">
          <h2 className="text-3xl font-bold text-gray-900">Sign in to view your watchlists</h2>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Watchlists</h1>

        <Tabs defaultValue="default" className="w-full">
          <TabsList>
            <TabsTrigger value="default">Default Lists</TabsTrigger>
            <TabsTrigger value="custom">Custom Lists</TabsTrigger>
          </TabsList>

          <TabsContent value="default">
            <div className="grid grid-cols-1 gap-8">
              {Object.entries(categories).map(([category, label]) => (
                <div key={category} className="space-y-4">
                  <h2 className="text-2xl font-semibold text-gray-900">{label}</h2>
                  {watchlists[category as WatchlistCategory].length === 0 ? (
                    <p className="text-gray-500">No items in this list</p>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {watchlists[category as WatchlistCategory].map((item) => (
                        <div key={item.id} className="relative group">
                          <MediaCard item={item} showType={true} />
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex gap-2">
                              <Button
                                variant="destructive"
                                size="icon"
                                className="w-8 h-8"
                                onClick={() => removeFromWatchlist(item.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom">
            <div className="mb-8">
              {showNewWatchlistInput ? (
                <div className="flex gap-2 items-center">
                  <Input
                    type="text"
                    placeholder="Enter watchlist name"
                    value={newWatchlistName}
                    onChange={(e) => setNewWatchlistName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateCustomWatchlist();
                      }
                    }}
                  />
                  <Button onClick={handleCreateCustomWatchlist}>
                    <Check className="w-4 h-4 mr-2" />
                    Create
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowNewWatchlistInput(false);
                      setNewWatchlistName('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setShowNewWatchlistInput(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Watchlist
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-8">
              {customWatchlists.map((watchlist) => (
                <div key={watchlist.id} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-gray-900">{watchlist.name}</h2>
                    <Button
                      variant="destructive"
                      onClick={() => deleteCustomWatchlist(watchlist.id)}
                    >
                      Delete List
                    </Button>
                  </div>
                  {watchlist.items.length === 0 ? (
                    <p className="text-gray-500">No items in this list</p>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {watchlist.items.map((item) => (
                        <div key={item.id} className="relative group">
                          <MediaCard item={item} showType={true} />
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="destructive"
                              size="icon"
                              className="w-8 h-8"
                              onClick={() => removeFromCustomWatchlist(watchlist.id, item.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};