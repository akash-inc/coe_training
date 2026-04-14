import { netflixMovies } from "../assets/data";
import type { Movie, NewMovie } from "../types/movie";
import { useEffect, useMemo, useState } from "react";

const SESSION_MOVIES_KEY = "practice.userMovies";

function loadSessionMovies(): Movie[] {
  try {
    const saved = sessionStorage.getItem(SESSION_MOVIES_KEY);
    if (!saved) {
      return [];
    }
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? (parsed as Movie[]) : [];
  } catch {
    return [];
  }
}

export function useMoviesStore() {
  const [userMovies, setUserMovies] = useState<Movie[]>(loadSessionMovies);

  const allMovies = useMemo(() => [...netflixMovies, ...userMovies], [userMovies]);
  const nextMovieId = useMemo(
    () => allMovies.reduce((maxId, movie) => Math.max(maxId, movie.id), 0) + 1,
    [allMovies],
  );

  useEffect(() => {
    sessionStorage.setItem(SESSION_MOVIES_KEY, JSON.stringify(userMovies));
  }, [userMovies]);

  function addMovie(movie: NewMovie): void {
    setUserMovies((prev) => [...prev, { ...movie, id: nextMovieId }]);
  }

  return {
    allMovies,
    addMovie,
  };
}
