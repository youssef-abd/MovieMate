import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WatchlistProvider } from './contexts/WatchlistContext';
import { UserProfileProvider } from './contexts/UserProfileContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ExploreSection } from './components/Explore/ExploreSection';
import { MoviesPage } from './pages/MoviesPage';
import { TvShowsPage } from './pages/TvShowsPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { RatingsPage } from './pages/RatingsPage';
import { MediaDetails } from './components/Media/MediaDetails';
import { AnimePage } from './pages/AnimePage';
import { UserSearchPage } from './pages/UserSearchPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { UsernameSetup } from './components/Auth/UsernameSetup';

const HomePage = () => (
  <main>
    <Hero />
    <ExploreSection />
  </main>
);

// Component to handle refresh redirect
const RefreshHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem('shouldRedirect', 'true');
    };

    const checkRedirect = () => {
      const shouldRedirect = sessionStorage.getItem('shouldRedirect');
      if (shouldRedirect === 'true') {
        sessionStorage.removeItem('shouldRedirect');
        navigate('/', { replace: true });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    checkRedirect();

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [navigate]);

  return null;
};

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/" />;
};

// Main App Content
const AppContent = () => {
  const { user, loading, hasUsername } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // Redirect to username setup if user is logged in but doesn't have a username
  if (user && !hasUsername) {
    return <UsernameSetup />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        {/* Base routes */}
        <Route path="/" element={<HomePage />} />
        
        {/* Movie routes */}
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/movies/:category" element={<MoviesPage />} />
        <Route path="/movies/details/:id" element={<MediaDetails type="movie" />} />
        
        {/* TV Show routes */}
        <Route path="/tv-shows" element={<TvShowsPage />} />
        <Route path="/tv-shows/:category" element={<TvShowsPage />} />
        <Route path="/tv-shows/details/:id" element={<MediaDetails type="tv" />} />
        
        {/* Anime routes */}
        <Route path="/anime" element={<AnimePage />} />
        <Route path="/anime/:category" element={<AnimePage />} />
        <Route path="/anime/details/:id" element={<MediaDetails type="anime" />} />
        
        {/* Protected User routes */}
        <Route 
          path="/watchlist" 
          element={
            <ProtectedRoute>
              <WatchlistPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ratings" 
          element={
            <ProtectedRoute>
              <RatingsPage />
            </ProtectedRoute>
          } 
        />
        <Route path="/search-users" element={<UserSearchPage />} />
        <Route path="/profile/:uid" element={<UserProfilePage />} />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <WatchlistProvider>
          <UserProfileProvider>
            <RefreshHandler />
            <AppContent />
          </UserProfileProvider>
        </WatchlistProvider>
      </Router>
    </AuthProvider>
  );
};

export default App;