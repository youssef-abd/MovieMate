import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Settings, Users, Film, Tv, Star, MessageCircle, Edit } from 'lucide-react';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { UserProfile } from '@/types/user';

export const UserProfilePage = () => {
  const { uid } = useParams<{ uid: string }>();
  const { user } = useAuth();
  const { 
    currentUserProfile,
    getUserProfile,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
  } = useUserProfile();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [following, setFollowing] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('watchlist');

  const isOwnProfile = user?.uid === uid;
  const isFollowing = currentUserProfile?.following.includes(uid || '');

  useEffect(() => {
    const loadProfileData = async () => {
      if (!uid) return;

      setIsLoading(true);
      try {
        const [profileData, followersData, followingData] = await Promise.all([
          getUserProfile(uid),
          getFollowers(uid),
          getFollowing(uid),
        ]);

        setProfile(profileData);
        setFollowers(followersData);
        setFollowing(followingData);
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [uid]);

  const handleFollowToggle = async () => {
    if (!uid) return;
    
    try {
      if (isFollowing) {
        await unfollowUser(uid);
      } else {
        await followUser(uid);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        User not found
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
              {profile.photoURL ? (
                <img 
                  src={profile.photoURL} 
                  alt={profile.displayName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-purple-100 text-purple-600 text-4xl font-bold">
                  {profile.displayName[0].toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{profile.displayName}</h1>
                  <p className="text-gray-500">@{profile.username}</p>
                </div>

                {isOwnProfile ? (
                  <Button variant="outline" onClick={() => {}}>
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <Button 
                    variant={isFollowing ? "outline" : "default"}
                    onClick={handleFollowToggle}
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </Button>
                )}
              </div>

              <p className="mt-4">{profile.bio}</p>

              <div className="flex items-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">{followers.length}</span>
                  <span className="text-gray-500">followers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">{following.length}</span>
                  <span className="text-gray-500">following</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-3">
              <Film className="w-5 h-5 text-purple-600" />
              <span className="text-gray-500">Movies Watched</span>
            </div>
            <p className="text-2xl font-bold mt-2">{profile.stats.totalMoviesWatched}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-3">
              <Tv className="w-5 h-5 text-purple-600" />
              <span className="text-gray-500">TV Shows Watched</span>
            </div>
            <p className="text-2xl font-bold mt-2">{profile.stats.totalTvShowsWatched}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-purple-600" />
              <span className="text-gray-500">Average Rating</span>
            </div>
            <p className="text-2xl font-bold mt-2">{profile.stats.averageRating.toFixed(1)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-purple-600" />
              <span className="text-gray-500">Reviews</span>
            </div>
            <p className="text-2xl font-bold mt-2">{profile.stats.totalReviews}</p>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="ratings">Ratings</TabsTrigger>
            <TabsTrigger value="lists">Lists</TabsTrigger>
          </TabsList>

          <TabsContent value="watchlist">
            {/* Implement watchlist content */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-500">Watchlist content coming soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            {/* Implement reviews content */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-500">Reviews content coming soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="ratings">
            {/* Implement ratings content */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-500">Ratings content coming soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="lists">
            {/* Implement lists content */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-500">Lists content coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
