import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { AuthModal } from './AuthModal';
import { useAuth } from '@/contexts/AuthContext';

export const UserMenu = () => {
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (!user) {
    return (
      <>
        <Button onClick={() => setShowAuthModal(true)} variant="primary" size="sm">
          Sign In
        </Button>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </>
    );
  }

  return (
    <div className="relative group">
      <Button variant="ghost" size="sm" className="flex items-center space-x-2">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <UserIcon className="w-5 h-5" />
        )}
      </Button>
      
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
        <Link
          to="/watchlist"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          My Watchlist
        </Link>
        <Link
          to="/ratings"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          My Ratings
        </Link>
        <button
          onClick={signOut}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <LogOut className="w-4 h-4 inline mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  );
};