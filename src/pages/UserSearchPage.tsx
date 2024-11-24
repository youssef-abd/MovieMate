import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, UserMinus } from 'lucide-react';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { UserSearchResult } from '@/types/user';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useAuth } from '@/contexts/AuthContext';

export const UserSearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});
  const { searchUsers, getSuggestedUsers, followUser, unfollowUser, currentUserProfile } = useUserProfile();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadSuggestedUsers = async () => {
      try {
        const suggested = await getSuggestedUsers();
        setSuggestedUsers(suggested);
        
        // Initialize following status
        if (currentUserProfile) {
          const status: Record<string, boolean> = {};
          suggested.forEach(u => {
            status[u.uid] = currentUserProfile.following.includes(u.uid);
          });
          setFollowingStatus(status);
        }
      } catch (error) {
        console.error('Error loading suggested users:', error);
      }
    };

    loadSuggestedUsers();
  }, [getSuggestedUsers, currentUserProfile]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a username to search');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
      
      // Initialize following status for search results
      if (currentUserProfile) {
        const status: Record<string, boolean> = { ...followingStatus };
        results.forEach(u => {
          status[u.uid] = currentUserProfile.following.includes(u.uid);
        });
        setFollowingStatus(status);
      }

      if (results.length === 0) {
        setError('No users found matching your search');
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setError('Failed to search users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFollowToggle = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking follow button
    
    if (!user) {
      setError('Please sign in to follow users');
      return;
    }

    try {
      if (followingStatus[userId]) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }
      
      setFollowingStatus(prev => ({
        ...prev,
        [userId]: !prev[userId]
      }));
    } catch (error) {
      console.error('Error toggling follow status:', error);
      setError('Failed to update follow status. Please try again.');
    }
  };

  const UserCard = ({ user }: { user: UserSearchResult }) => (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-4">
        <div 
          className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 cursor-pointer"
          onClick={() => navigate(`/profile/${user.uid}`)}
        >
          {user.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={user.displayName} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-purple-100 text-purple-600 text-xl font-bold">
              {user.displayName[0].toUpperCase()}
            </div>
          )}
        </div>

        <div 
          className="flex-1 cursor-pointer"
          onClick={() => navigate(`/profile/${user.uid}`)}
        >
          <h3 className="font-semibold text-lg">{user.displayName}</h3>
          <p className="text-gray-500 text-sm">@{user.username}</p>
          {user.bio && <p className="text-sm mt-1 line-clamp-2">{user.bio}</p>}
        </div>

        {user.uid !== currentUserProfile?.uid && (
          <Button
            variant={followingStatus[user.uid] ? "outline" : "default"}
            size="sm"
            className="ml-4"
            onClick={(e) => handleFollowToggle(user.uid, e)}
          >
            {followingStatus[user.uid] ? (
              <>
                <UserMinus className="w-4 h-4 mr-1" />
                Unfollow
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-1" />
                Follow
              </>
            )}
          </Button>
        )}
      </div>

      <div className="mt-4 cursor-pointer" onClick={() => navigate(`/profile/${user.uid}`)}>
        {user.sharedInterests.genres.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {user.sharedInterests.genres.slice(0, 3).map(genre => (
              <span 
                key={genre}
                className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs"
              >
                {genre}
              </span>
            ))}
            {user.sharedInterests.genres.length > 3 && (
              <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded-full text-xs">
                +{user.sharedInterests.genres.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
          {user.mutualFollowers > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {user.mutualFollowers} mutual follower{user.mutualFollowers !== 1 ? 's' : ''}
            </span>
          )}
          {user.sharedInterests.movies > 0 && (
            <span className="text-gray-500">
              {user.sharedInterests.movies} movies watched
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Find Movie Mates</h1>

      <div className="max-w-2xl mx-auto">
        <div className="flex gap-4 mb-8">
          <Input
            type="text"
            placeholder="Search users by username or display name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setError(null);
            }}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button 
            onClick={handleSearch}
            disabled={isLoading}
            className="w-24"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            {error}
          </Alert>
        )}

        {searchResults.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Search Results</h2>
            {searchResults.map((user) => (
              <UserCard key={user.uid} user={user} />
            ))}
          </div>
        ) : searchQuery.trim() === '' && suggestedUsers.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Suggested Users</h2>
            {suggestedUsers.map((user) => (
              <UserCard key={user.uid} user={user} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};
