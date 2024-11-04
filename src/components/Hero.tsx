import React from 'react';
import { Play, Plus } from 'lucide-react';
import { Button } from './ui/Button';

export const Hero = () => {
  return (
    <div className="relative h-[80vh] flex items-center">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80"
          alt="Hero background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/20" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            Track Your Favorite Shows
          </h1>
          <p className="mt-6 text-xl text-gray-300">
            Discover, track, and share your favorite movies, TV shows, and anime. Join our community of entertainment enthusiasts.
          </p>
          <div className="mt-10 flex items-center space-x-4">
            <Button size="lg" className="group">
              <Play className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
              Get Started
            </Button>
            <Button variant="secondary" size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Add to Watchlist
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};