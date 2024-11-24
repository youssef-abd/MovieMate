import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, setDoc, getDoc, updateDoc, collection, addDoc, getDocs, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';

export type MediaItem = {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  media_type: 'movie' | 'tv' | 'anime';
  overview?: string;
  vote_average?: number;
  episodeRatings?: { [key: string]: number };
};

export type WatchlistCategory = 'plan_to_watch' | 'watching' | 'completed' | 'dropped';

export type CustomWatchlist = {
  id: string;
  name: string;
  items: MediaItem[];
  createdAt: Date;
};

interface WatchlistItem extends MediaItem {
  category: WatchlistCategory;
  addedAt: Date;
  notes?: string;
}

interface WatchlistContextType {
  watchlists: Record<WatchlistCategory, WatchlistItem[]>;
  customWatchlists: CustomWatchlist[];
  addToWatchlist: (item: MediaItem, category: WatchlistCategory) => Promise<void>;
  removeFromWatchlist: (itemId: number) => Promise<void>;
  moveToCategory: (itemId: number, newCategory: WatchlistCategory) => Promise<void>;
  isInWatchlist: (itemId: number) => boolean;
  getItemCategory: (itemId: number) => WatchlistCategory | null;
  ratings: { [key: string]: number };
  rateMedia: (mediaId: string | number, rating: number) => Promise<void>;
  getRating: (mediaId: string | number) => number | undefined;
  createCustomWatchlist: (name: string) => Promise<void>;
  deleteCustomWatchlist: (id: string) => Promise<void>;
  addToCustomWatchlist: (watchlistId: string, item: MediaItem) => Promise<void>;
  removeFromCustomWatchlist: (watchlistId: string, itemId: number) => Promise<void>;
  isInCustomWatchlist: (watchlistId: string, itemId: number) => boolean;
  updateItemNotes: (itemId: number, notes: string) => Promise<void>;
}

const WatchlistContext = createContext<WatchlistContextType | null>(null);

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [watchlists, setWatchlists] = useState<Record<WatchlistCategory, WatchlistItem[]>>({
    plan_to_watch: [],
    watching: [],
    completed: [],
    dropped: []
  });
  const [customWatchlists, setCustomWatchlists] = useState<CustomWatchlist[]>([]);
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadWatchlists();
      loadRatings();
      loadCustomWatchlists();
    } else {
      setWatchlists({
        plan_to_watch: [],
        watching: [],
        completed: [],
        dropped: []
      });
      setRatings({});
      setCustomWatchlists([]);
    }
  }, [user]);

  const loadWatchlists = async () => {
    if (!user) return;
    const watchlistRef = collection(db, `users/${user.uid}/watchlist`);
    const snapshot = await getDocs(watchlistRef);
    const items = snapshot.docs.map(doc => ({
      id: parseInt(doc.id),
      ...doc.data()
    })) as WatchlistItem[];

    const categorizedItems: Record<WatchlistCategory, WatchlistItem[]> = {
      plan_to_watch: [],
      watching: [],
      completed: [],
      dropped: []
    };

    items.forEach(item => {
      if (item.category) {
        categorizedItems[item.category].push(item);
      }
    });

    setWatchlists(categorizedItems);
  };

  const loadCustomWatchlists = async () => {
    if (!user) return;
    try {
      const customWatchlistsRef = collection(db, 'users', user.uid, 'customWatchlists');
      const snapshot = await getDocs(customWatchlistsRef);
      const watchlists = await Promise.all(snapshot.docs.map(async (doc) => {
        const data = doc.data();
        // Migrate old format to new format if needed
        if (!data.items) {
          const updatedData = {
            id: doc.id,
            name: data.name || 'Untitled List',
            items: [],
            createdAt: data.createdAt?.toDate() || new Date(),
          };
          await setDoc(doc.ref, updatedData);
          return updatedData as CustomWatchlist;
        }
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          items: data.items || []
        } as CustomWatchlist;
      }));
      setCustomWatchlists(watchlists);
    } catch (error) {
      console.error('Error loading custom watchlists:', error);
    }
  };

  const loadRatings = async () => {
    if (!user) return;
    const docRef = doc(db, 'ratings', user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setRatings(docSnap.data().ratings || {});
    } else {
      await setDoc(docRef, { ratings: {} });
    }
  };

  const addToWatchlist = async (item: MediaItem, category: WatchlistCategory) => {
    if (!user) return;
    const watchlistRef = doc(db, `users/${user.uid}/watchlist/${item.id}`);
    const watchlistItem: WatchlistItem = {
      ...item,
      category,
      addedAt: new Date(),
    };
    
    await setDoc(watchlistRef, watchlistItem);
    setWatchlists(prev => ({
      ...prev,
      [category]: [...prev[category], watchlistItem]
    }));
  };

  const removeFromWatchlist = async (itemId: number) => {
    if (!user) return;
    const watchlistRef = doc(db, `users/${user.uid}/watchlist/${itemId}`);
    await deleteDoc(watchlistRef);
    
    setWatchlists(prev => {
      const newWatchlists = { ...prev };
      Object.keys(newWatchlists).forEach(category => {
        newWatchlists[category as WatchlistCategory] = newWatchlists[category as WatchlistCategory]
          .filter(item => item.id !== itemId);
      });
      return newWatchlists;
    });
  };

  const moveToCategory = async (itemId: number, newCategory: WatchlistCategory) => {
    if (!user) return;
    
    // Find the item in any category
    let item: WatchlistItem | undefined;
    Object.values(watchlists).forEach(categoryItems => {
      const found = categoryItems.find(i => i.id === itemId);
      if (found) item = found;
    });

    if (!item) return;

    const watchlistRef = doc(db, `users/${user.uid}/watchlist/${itemId}`);
    const updatedItem = { ...item, category: newCategory };
    await setDoc(watchlistRef, updatedItem);

    setWatchlists(prev => {
      const newWatchlists = { ...prev };
      // Remove from all categories
      Object.keys(newWatchlists).forEach(category => {
        newWatchlists[category as WatchlistCategory] = newWatchlists[category as WatchlistCategory]
          .filter(i => i.id !== itemId);
      });
      // Add to new category
      newWatchlists[newCategory] = [...newWatchlists[newCategory], updatedItem];
      return newWatchlists;
    });
  };

  const isInWatchlist = (itemId: number) => {
    return Object.values(watchlists).some(categoryItems =>
      categoryItems.some(item => item.id === itemId)
    );
  };

  const getItemCategory = (itemId: number): WatchlistCategory | null => {
    for (const [category, items] of Object.entries(watchlists)) {
      if (items.some(item => item.id === itemId)) {
        return category as WatchlistCategory;
      }
    }
    return null;
  };

  const updateItemNotes = async (itemId: number, notes: string) => {
    if (!user) return;
    const watchlistRef = doc(db, `users/${user.uid}/watchlist/${itemId}`);
    await updateDoc(watchlistRef, { notes });

    setWatchlists(prev => {
      const newWatchlists = { ...prev };
      Object.keys(newWatchlists).forEach(category => {
        newWatchlists[category as WatchlistCategory] = newWatchlists[category as WatchlistCategory]
          .map(item => item.id === itemId ? { ...item, notes } : item);
      });
      return newWatchlists;
    });
  };

  const rateMedia = async (mediaId: string | number, rating: number) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        await setDoc(userRef, { ratings: {} });
      }

      await updateDoc(userRef, {
        [`ratings.${mediaId}`]: rating
      });

      // Update local state
      setRatings(prev => ({
        ...prev,
        [mediaId]: rating
      }));
    } catch (error) {
      console.error('Error rating media:', error);
    }
  };

  const getRating = (mediaId: string | number): number | undefined => {
    return ratings[mediaId];
  };

  const createCustomWatchlist = async (name: string) => {
    if (!user) return;
    try {
      const customWatchlistsRef = collection(db, 'users', user.uid, 'customWatchlists');
      const newWatchlist: Omit<CustomWatchlist, 'id'> = {
        name,
        items: [],
        createdAt: new Date(),
      };
      const docRef = await addDoc(customWatchlistsRef, newWatchlist);
      setCustomWatchlists(prev => [...prev, { ...newWatchlist, id: docRef.id }]);
    } catch (error) {
      console.error('Error creating custom watchlist:', error);
    }
  };

  const deleteCustomWatchlist = async (watchlistId: string) => {
    if (!user) return;
    try {
      const watchlistRef = doc(db, 'users', user.uid, 'customWatchlists', watchlistId);
      await deleteDoc(watchlistRef);
      setCustomWatchlists(prev => prev.filter(w => w.id !== watchlistId));
    } catch (error) {
      console.error('Error deleting custom watchlist:', error);
    }
  };

  const addToCustomWatchlist = async (watchlistId: string, item: MediaItem) => {
    if (!user) return;
    try {
      const watchlistRef = doc(db, 'users', user.uid, 'customWatchlists', watchlistId);
      const watchlistDoc = await getDoc(watchlistRef);
      
      if (!watchlistDoc.exists()) return;
      
      const watchlistData = watchlistDoc.data();
      const items = Array.isArray(watchlistData.items) ? watchlistData.items : [];
      
      // Check if item already exists
      if (!items.some((i: MediaItem) => i.id === item.id)) {
        const updatedWatchlist = {
          ...watchlistData,
          items: [...items, item],
          createdAt: watchlistData.createdAt?.toDate() || new Date()
        };
        
        await setDoc(watchlistRef, updatedWatchlist);
        setCustomWatchlists(prev =>
          prev.map(w => w.id === watchlistId ? { ...w, items: updatedWatchlist.items } : w)
        );
      }
    } catch (error) {
      console.error('Error adding to custom watchlist:', error);
    }
  };

  const removeFromCustomWatchlist = async (watchlistId: string, itemId: number) => {
    if (!user) return;
    try {
      const watchlistRef = doc(db, 'users', user.uid, 'customWatchlists', watchlistId);
      const watchlistDoc = await getDoc(watchlistRef);
      
      if (!watchlistDoc.exists()) return;
      
      const watchlistData = watchlistDoc.data();
      const items = Array.isArray(watchlistData.items) ? watchlistData.items : [];
      
      const updatedWatchlist = {
        ...watchlistData,
        items: items.filter((i: MediaItem) => i.id !== itemId),
        createdAt: watchlistData.createdAt?.toDate() || new Date()
      };
      
      await setDoc(watchlistRef, updatedWatchlist);
      setCustomWatchlists(prev =>
        prev.map(w => w.id === watchlistId ? { ...w, items: updatedWatchlist.items } : w)
      );
    } catch (error) {
      console.error('Error removing from custom watchlist:', error);
    }
  };

  const isInCustomWatchlist = (watchlistId: string, itemId: number): boolean => {
    const watchlist = customWatchlists.find(w => w.id === watchlistId);
    if (!watchlist) return false;
    return watchlist.items?.some(item => item.id === itemId) || false;
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlists,
        customWatchlists,
        addToWatchlist,
        removeFromWatchlist,
        moveToCategory,
        isInWatchlist,
        getItemCategory,
        ratings,
        rateMedia,
        getRating,
        createCustomWatchlist,
        deleteCustomWatchlist,
        addToCustomWatchlist,
        removeFromCustomWatchlist,
        isInCustomWatchlist,
        updateItemNotes
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};
