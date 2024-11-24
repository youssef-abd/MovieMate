import React, { useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();

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
    setError(null);

    try {
      if (isSignUp) {
        // Validate username for sign up
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

        // Sign up the user
        await signUp(email, password);

        // Get the newly created user
        const user = auth.currentUser;
        if (!user) {
          throw new Error('Failed to create user');
        }

        // Create username document
        await setDoc(doc(db, 'usernames', username.toLowerCase()), {
          uid: user.uid
        });

        // Create user profile
        await setDoc(doc(db, 'userProfiles', user.uid), {
          uid: user.uid,
          username: username.toLowerCase(),
          displayName: username,
          photoURL: null,
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
        });
      } else {
        await signIn(email, password);
      }

      onClose();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred during authentication');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black bg-opacity-50">
      <div className="min-h-screen text-center p-4">
        {/* This element is to trick the browser into centering the modal contents. */}
        <span className="inline-block h-screen align-middle" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </h3>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <Alert variant="destructive">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  required={isSignUp}
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <Button type="submit" className="w-full">
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setUsername('');
                setEmail('');
                setPassword('');
              }}
              className="text-purple-600 hover:text-purple-500"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};