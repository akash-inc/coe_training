export type Movie = {
  id: number;
  title: string;
  year: number;
  genre: string[];
  director: string;
  cast: string[];
  rating: number;
  durationMin: number;
  isNetflixOriginal: boolean;
  watchedDate: string;
  link: string;
  trailerLink?: string;
  bookmarkable?: boolean;
};

export type NewMovie = Omit<Movie, "id">;
