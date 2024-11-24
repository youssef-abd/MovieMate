import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, signIn as firebaseSignIn, signUp as firebaseSignUp } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  hasUsername: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasUsername, setHasUsername] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Check if user has a username
        const userProfileDoc = await getDoc(doc(db, 'userProfiles', user.uid));
        setHasUsername(userProfileDoc.exists() && userProfileDoc.data()?.username);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    try {
      setError(null);
      await firebaseSignIn(email, password);
      setShowAuthModal(false); // Close modal after successful sign in
    } catch (err) {
      setError('Failed to sign in. Please check your credentials.');
      console.error('Sign in error:', err);
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    try {
      setError(null);
      await firebaseSignUp(email, password);
      setShowAuthModal(false); // Close modal after successful sign up
    } catch (err) {
      setError('Failed to create account. Please try again.');
      console.error('Sign up error:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        hasUsername,
        signIn: handleSignIn, 
        signUp: handleSignUp, 
        signOut: handleSignOut,
        error,
        showAuthModal,
        setShowAuthModal
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}