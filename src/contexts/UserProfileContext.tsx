import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, doc, getDoc, getDocs, query, where, updateDoc, arrayUnion, arrayRemove, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { UserProfile, UserSearchResult, UserPrivacySettings } from '@/types/user';

interface UserProfileContextType {
  currentUserProfile: UserProfile | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updatePrivacySettings: (settings: Partial<UserPrivacySettings>) => Promise<void>;
  searchUsers: (query: string) => Promise<UserSearchResult[]>;
  getUserProfile: (uid: string) => Promise<UserProfile | null>;
  followUser: (uid: string) => Promise<void>;
  unfollowUser: (uid: string) => Promise<void>;
  getFollowers: (uid: string) => Promise<UserProfile[]>;
  getFollowing: (uid: string) => Promise<UserProfile[]>;
  getSuggestedUsers: () => Promise<UserSearchResult[]>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) {
        setCurrentUserProfile(null);
        return;
      }

      const userDoc = await getDoc(doc(db, 'userProfiles', user.uid));
      if (userDoc.exists()) {
        setCurrentUserProfile(userDoc.data() as UserProfile);
      } else {
        // Create default profile for new users
        const defaultProfile: UserProfile = {
          uid: user.uid,
          username: user.email?.split('@')[0] || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL,
          bio: '',
          favoriteGenres: [],
          favoriteDirectors: [],
          joinDate: new Date().toISOString(),
          privacySettings: {
            profileVisibility: 'public',
            showWatchlist: true,
            showRatings: true,
            showReviews: true,
            showFollowers: true,
          },
          followers: [],
          following: [],
          stats: {
            totalMoviesWatched: 0,
            totalTvShowsWatched: 0,
            averageRating: 0,
            totalReviews: 0,
          },
        };

        await updateDoc(doc(db, 'userProfiles', user.uid), defaultProfile);
        setCurrentUserProfile(defaultProfile);
      }
    };

    loadUserProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    await updateDoc(doc(db, 'userProfiles', user.uid), updates);
    setCurrentUserProfile(prev => prev ? { ...prev, ...updates } : null);
  };

  const updatePrivacySettings = async (settings: Partial<UserPrivacySettings>) => {
    if (!user || !currentUserProfile) return;
    const updatedSettings = { ...currentUserProfile.privacySettings, ...settings };
    await updateProfile({ privacySettings: updatedSettings });
  };

  const searchUsers = async (searchQuery: string): Promise<UserSearchResult[]> => {
    if (!searchQuery.trim()) return [];

    const usersRef = collection(db, 'userProfiles');
    const lowercaseQuery = searchQuery.toLowerCase().trim();
    const results = new Map<string, UserSearchResult>();

    // Get all public profiles that match our criteria
    const publicProfilesQuery = query(
      usersRef,
      where('privacySettings.profileVisibility', '==', 'public'),
      limit(20)
    );

    const snapshot = await getDocs(publicProfilesQuery);
    
    // Filter and process results locally for more flexible matching
    for (const doc of snapshot.docs) {
      const userData = doc.data() as UserProfile;
      
      // Skip current user
      if (userData.uid === user?.uid) continue;

      // Check if username or display name matches the search query
      const usernameMatch = userData.username.toLowerCase().includes(lowercaseQuery);
      const displayNameMatch = userData.displayName.toLowerCase().includes(lowercaseQuery);

      if (usernameMatch || displayNameMatch) {
        results.set(userData.uid, {
          uid: userData.uid,
          username: userData.username,
          displayName: userData.displayName,
          photoURL: userData.photoURL,
          bio: userData.bio || '',
          sharedInterests: {
            genres: userData.favoriteGenres || [],
            directors: userData.favoriteDirectors || [],
            movies: userData.stats.totalMoviesWatched || 0
          },
          mutualFollowers: 0
        });

        // Stop if we have enough results
        if (results.size >= 10) break;
      }
    }

    // Calculate mutual followers if user is logged in
    if (user && currentUserProfile && results.size > 0) {
      const currentUserFollowing = new Set(currentUserProfile.following);
      
      for (const [uid, result] of results) {
        const userProfile = await getDoc(doc(db, 'userProfiles', uid));
        if (userProfile.exists()) {
          const userData = userProfile.data() as UserProfile;
          const userFollowers = new Set(userData.followers);
          
          // Count mutual followers
          let mutualCount = 0;
          for (const follower of currentUserProfile.followers) {
            if (userFollowers.has(follower)) {
              mutualCount++;
            }
          }
          
          result.mutualFollowers = mutualCount;
        }
      }
    }

    return Array.from(results.values());
  };

  const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    const userDoc = await getDoc(doc(db, 'userProfiles', uid));
    return userDoc.exists() ? userDoc.data() as UserProfile : null;
  };

  const followUser = async (uid: string) => {
    if (!user || !currentUserProfile) return;
    
    // Update current user's following list
    await updateDoc(doc(db, 'userProfiles', user.uid), {
      following: arrayUnion(uid)
    });

    // Update target user's followers list
    await updateDoc(doc(db, 'userProfiles', uid), {
      followers: arrayUnion(user.uid)
    });

    setCurrentUserProfile(prev => 
      prev ? { ...prev, following: [...prev.following, uid] } : null
    );
  };

  const unfollowUser = async (uid: string) => {
    if (!user || !currentUserProfile) return;
    
    // Update current user's following list
    await updateDoc(doc(db, 'userProfiles', user.uid), {
      following: arrayRemove(uid)
    });

    // Update target user's followers list
    await updateDoc(doc(db, 'userProfiles', uid), {
      followers: arrayRemove(user.uid)
    });

    setCurrentUserProfile(prev => 
      prev ? { 
        ...prev, 
        following: prev.following.filter(id => id !== uid) 
      } : null
    );
  };

  const getFollowers = async (uid: string): Promise<UserProfile[]> => {
    const profile = await getUserProfile(uid);
    if (!profile) return [];

    const followers: UserProfile[] = [];
    for (const followerId of profile.followers) {
      const followerProfile = await getUserProfile(followerId);
      if (followerProfile) followers.push(followerProfile);
    }

    return followers;
  };

  const getFollowing = async (uid: string): Promise<UserProfile[]> => {
    const profile = await getUserProfile(uid);
    if (!profile) return [];

    const following: UserProfile[] = [];
    for (const followingId of profile.following) {
      const followingProfile = await getUserProfile(followingId);
      if (followingProfile) following.push(followingProfile);
    }

    return following;
  };

  const getSuggestedUsers = async (): Promise<UserSearchResult[]> => {
    if (!user || !currentUserProfile) return [];

    const usersRef = collection(db, 'userProfiles');
    const q = query(
      usersRef,
      where('privacySettings.profileVisibility', '==', 'public'),
      orderBy('stats.totalMoviesWatched', 'desc'),
      limit(10)
    );

    const snapshot = await getDocs(q);
    const results: UserSearchResult[] = [];

    for (const doc of snapshot.docs) {
      const userData = doc.data() as UserProfile;
      if (userData.uid === user.uid || currentUserProfile.following.includes(userData.uid)) continue;

      results.push({
        uid: userData.uid,
        username: userData.username,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        bio: userData.bio || '',
        sharedInterests: {
          genres: userData.favoriteGenres || [],
          directors: userData.favoriteDirectors || [],
          movies: userData.stats.totalMoviesWatched || 0
        },
        mutualFollowers: 0
      });

      if (results.length >= 10) break;
    }

    // Calculate mutual followers
    if (currentUserProfile && results.length > 0) {
      for (const result of results) {
        const userProfile = await getDoc(doc(db, 'userProfiles', result.uid));
        if (userProfile.exists()) {
          const userData = userProfile.data() as UserProfile;
          const userFollowers = new Set(userData.followers);
          
          let mutualCount = 0;
          for (const follower of currentUserProfile.followers) {
            if (userFollowers.has(follower)) {
              mutualCount++;
            }
          }
          
          result.mutualFollowers = mutualCount;
        }
      }
    }

    return results;
  };

  return (
    <UserProfileContext.Provider
      value={{
        currentUserProfile,
        updateProfile,
        updatePrivacySettings,
        searchUsers,
        getUserProfile,
        followUser,
        unfollowUser,
        getFollowers,
        getFollowing,
        getSuggestedUsers,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};
