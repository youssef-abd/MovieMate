import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ExploreSection } from './components/Explore/ExploreSection';
import { WatchlistPage } from './pages/WatchlistPage';
import { RatingsPage } from './pages/RatingsPage';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={
              <main>
                <Hero />
                <ExploreSection />
              </main>
            } />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/ratings" element={<RatingsPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;