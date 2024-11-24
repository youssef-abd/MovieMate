import  { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { AuthModal } from '@/components/Auth/AuthModal';
import { SearchBar } from '@/components/Search/SearchBar';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;

  const menuItems = {
    Movies: [
      { label: 'All Movies', path: '/movies' },
      { label: 'Popular', path: '/movies/popular' },
      { label: 'Top Rated', path: '/movies/top-rated' },
      { label: 'Upcoming', path: '/movies/upcoming' },
      { label: 'Now Playing', path: '/movies/now-playing' },
    ],
    'TV Shows': [
      { label: 'All TV Shows', path: '/tv-shows' },
      { label: 'Popular', path: '/tv-shows/popular' },
      { label: 'Top Rated', path: '/tv-shows/top-rated' },
      { label: 'On The Air', path: '/tv-shows/on-the-air' },
      { label: 'Airing Today', path: '/tv-shows/airing-today' },
    ],
    Anime: [
      { label: 'All Anime', path: '/anime' },
      { label: 'Popular', path: '/anime/popular' },
      { label: 'Top Rated', path: '/anime/top-rated' },
      { label: 'Currently Airing', path: '/anime/airing' },
    ],
  };

  const toggleDropdown = (menu: string) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  const closeDropdowns = () => {
    setActiveDropdown(null);
    setIsOpen(false);
  };

  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center" onClick={closeDropdowns}>
              <span className="text-2xl font-bold text-purple-600">MovieMate</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {Object.entries(menuItems).map(([key, items]) => (
                <div key={key} className="relative">
                  <button
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                      items.some(item => isActive(item.path))
                        ? 'text-purple-600'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                    onClick={() => toggleDropdown(key)}
                  >
                    {key}
                    <ChevronDown className={`ml-1 h-4 w-4 transform ${activeDropdown === key ? 'rotate-180' : ''}`} />
                  </button>

                  {activeDropdown === key && (
                    <div className="absolute z-10 -ml-4 mt-3 w-screen max-w-md transform px-2 sm:px-0 lg:left-1/2 lg:-translate-x-1/2">
                      <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                        <div className="relative grid gap-2 bg-white px-5 py-6 sm:gap-4 sm:p-8">
                          {items.map((item) => (
                            <Link
                              key={item.path}
                              to={item.path}
                              className={`block rounded-md px-3 py-2 text-base font-medium ${
                                isActive(item.path)
                                  ? 'text-purple-600 bg-purple-50'
                                  : 'text-gray-900 hover:bg-purple-50'
                              }`}
                              onClick={closeDropdowns}
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <Link to="/search-users" className="hover:text-purple-500">Find MovieMate</Link>
              {user && (
                <Link to={`/profile/${user.uid}`} className="hover:text-purple-500">Profile</Link>
              )}
              {user && (
                <Link
                  to="/watchlist"
                  className={`${
                    pathname === '/watchlist'
                      ? 'text-purple-600'
                      : 'text-gray-500 hover:text-purple-600'
                  } font-medium`}
                >
                  My Watchlists
                </Link>
              )}
            </div>
          </div>

          {/* Search and Auth Buttons */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <SearchBar />
            </div>
            
            {/* Desktop Auth Button */}
            <div className="hidden md:block">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('user')}
                    className="flex items-center gap-2 p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100"
                  >
                    <User className="w-6 h-6" />
                  </button>

                  {activeDropdown === 'user' && (
                    <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                      <Link
                        to="/watchlist"
                        className={`block px-4 py-2 text-sm ${
                          isActive('/watchlist')
                            ? 'text-purple-600 bg-purple-50'
                            : 'text-gray-700 hover:bg-purple-50'
                        }`}
                        onClick={closeDropdowns}
                      >
                        My Watchlist
                      </Link>
                      <Link
                        to="/ratings"
                        className={`block px-4 py-2 text-sm ${
                          isActive('/ratings')
                            ? 'text-purple-600 bg-purple-50'
                            : 'text-gray-700 hover:bg-purple-50'
                        }`}
                        onClick={closeDropdowns}
                      >
                        My Ratings
                      </Link>
                      <button
                        onClick={() => {
                          signOut();
                          closeDropdowns();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  variant="ghost"
                  className="flex items-center gap-2"
                  onClick={() => setShowAuthModal(true)}
                >
                  <User className="w-5 h-5" />
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          {/* Mobile Search */}
          <div className="px-2 pt-2 pb-3">
            <SearchBar />
          </div>

          <div className="space-y-1 px-2 pb-3">
            {Object.entries(menuItems).map(([key, items]) => (
              <div key={key} className="space-y-1">
                <button
                  className={`w-full text-left px-3 py-2 text-base font-medium rounded-md ${
                    items.some(item => isActive(item.path))
                      ? 'text-purple-600 bg-purple-50'
                      : 'text-gray-900 hover:bg-purple-50'
                  }`}
                  onClick={() => toggleDropdown(key)}
                >
                  <div className="flex items-center justify-between">
                    {key}
                    <ChevronDown className={`ml-1 h-4 w-4 transform ${activeDropdown === key ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {activeDropdown === key && (
                  <div className="pl-4">
                    {items.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`block px-3 py-2 text-base font-medium rounded-md ${
                          isActive(item.path)
                            ? 'text-purple-600 bg-purple-50'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-purple-50'
                        }`}
                        onClick={closeDropdowns}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          
            <Link to="/search-users" className="block px-3 py-2 text-base font-medium rounded-md hover:text-purple-500">Find MovieMate</Link>
            {user && (
              <Link to={`/profile/${user.uid}`} className="block px-3 py-2 text-base font-medium rounded-md hover:text-purple-500">Profile</Link>
            )}
            {user && (
              <Link
                to="/watchlist"
                className={`block px-3 py-2 text-base font-medium rounded-md ${
                  pathname === '/watchlist'
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-purple-50'
                }`}
                onClick={closeDropdowns}
              >
                My Watchlists
              </Link>
            )}
            {/* Mobile Auth Button */}
            <div className="mt-4 px-3">
              {user ? (
                <div className="space-y-1">
                  <Link
                    to="/watchlist"
                    className={`block px-3 py-2 text-base font-medium rounded-md ${
                      pathname === '/watchlist'
                        ? 'text-purple-600 bg-purple-50'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-purple-50'
                    }`}
                    onClick={closeDropdowns}
                  >
                    My Watchlist
                  </Link>
                  <Link
                    to="/ratings"
                    className={`block px-3 py-2 text-base font-medium rounded-md ${
                      pathname === '/ratings'
                        ? 'text-purple-600 bg-purple-50'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-purple-50'
                    }`}
                    onClick={closeDropdowns}
                  >
                    My Ratings
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => {
                      signOut();
                      closeDropdowns();
                    }}
                  >
                    <User className="w-5 h-5" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => {
                    setShowAuthModal(true);
                    closeDropdowns();
                  }}
                >
                  <User className="w-5 h-5" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </nav>
  );
};