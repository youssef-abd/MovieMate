
import { Button } from '../ui/Button';
import { useGenres } from '@/hooks/useTMDB';

interface GenreFilterProps {
  selectedGenres: number[];
  onChange: (genres: number[]) => void;
}

export const GenreFilter = ({ selectedGenres, onChange }: GenreFilterProps) => {
  const { genres, loading } = useGenres();

  const toggleGenre = (genreId: number) => {
    if (selectedGenres.includes(genreId)) {
      onChange(selectedGenres.filter(id => id !== genreId));
    } else {
      onChange([...selectedGenres, genreId]);
    }
  };

  if (loading) {
    return (
      <div className="h-12 flex items-center">
        <span className="text-gray-500">Loading genres...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Genres</h3>
      <div className="flex flex-wrap gap-2">
        {genres.map(genre => (
          <Button
            key={genre.id}
            variant={selectedGenres.includes(genre.id) ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => toggleGenre(genre.id)}
          >
            {genre.name}
          </Button>
        ))}
      </div>
    </div>
  );
};