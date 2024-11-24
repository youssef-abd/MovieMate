import React, { useState } from 'react';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X, Edit2, Check } from 'lucide-react';
import MediaCard from '../Media/MediaCard';
import { WatchlistCategory } from '@/contexts/WatchlistContext';

const WatchlistPage = () => {
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

  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [showNewWatchlistInput, setShowNewWatchlistInput] = useState(false);
  const [editingNotes, setEditingNotes] = useState<{ [key: number]: string }>({});

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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Please sign in to view your watchlists</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Watchlists</h1>

      <Tabs defaultValue="default" className="w-full">
        <TabsList>
          <TabsTrigger value="default">Default Lists</TabsTrigger>
          <TabsTrigger value="custom">Custom Lists</TabsTrigger>
        </TabsList>

        <TabsContent value="default">
          <div className="grid grid-cols-1 gap-8">
            {Object.entries(categories).map(([category, label]) => (
              <div key={category} className="space-y-4">
                <h2 className="text-2xl font-semibold">{label}</h2>
                {watchlists[category as WatchlistCategory].length === 0 ? (
                  <p className="text-gray-500">No items in this list</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {watchlists[category as WatchlistCategory].map((item) => (
                      <div key={item.id} className="relative group">
                        <MediaCard
                          item={item}
                          showType={true}
                        />
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
                  <h2 className="text-2xl font-semibold">{watchlist.name}</h2>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {watchlist.items.map((item) => (
                      <div key={item.id} className="relative group">
                        <MediaCard
                          item={item}
                          showType={true}
                        />
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
  );
};

export default WatchlistPage;
