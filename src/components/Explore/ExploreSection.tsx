import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '../ui/Button';
import { MediaGrid } from './MediaGrid';
import { GenreFilter } from './GenreFilter';

export const ExploreSection = () => {
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Explore</h2>
        <Button
          variant="ghost"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2"
        >
          <Filter className="h-5 w-5" />
          <span>Filters</span>
        </Button>
      </div>

      {showFilters && (
        <div className="mb-8">
          <GenreFilter
            selectedGenres={selectedGenres}
            onChange={setSelectedGenres}
          />
        </div>
      )}

      <MediaGrid selectedGenres={selectedGenres} />
    </section>
  );
};