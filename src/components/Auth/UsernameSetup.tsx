import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';

export const UsernameSetup: React.FC = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const validateUsername = (username: string) => {
    if (username.length < 3) {
      return 'Username must be at least 3 characters long';
    }
    if (username.length > 20) {
      return 'Username must be less than 20 characters long';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return '';
  };

  const checkUsernameAvailability = async (username: string) => {
    const usernameDoc = doc(db, 'usernames', username.toLowerCase());
    const docSnap = await getDoc(usernameDoc);
    return !docSnap.exists();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    setError('');
    setIsLoading(true);

    try {
      // Validate username format
      const validationError = validateUsername(username);
      if (validationError) {
        setError(validationError);
        return;
      }

      // Check username availability
      const isAvailable = await checkUsernameAvailability(username);
      if (!isAvailable) {
        setError('Username is already taken');
        return;
      }

      // Create username document
      await setDoc(doc(db, 'usernames', username.toLowerCase()), {
        uid: user.uid
      });

      // Create or update user profile
      const userProfileRef = doc(db, 'userProfiles', user.uid);
      await setDoc(userProfileRef, {
        uid: user.uid,
        username: username.toLowerCase(),
        displayName: user.displayName || username,
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
      }, { merge: true });

      // Navigate to home page
      navigate('/');
    } catch (error) {
      setError('Failed to set username. Please try again.');
      console.error('Error setting username:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Choose your username
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            This will be your unique identifier on MovieMate
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
              disabled={isLoading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              {error}
            </Alert>
          )}

          <div>
            <Button
              type="submit"
              className="group relative w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Setting username...' : 'Continue'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
