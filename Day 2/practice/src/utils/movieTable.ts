import type { Movie } from "../types/movie";
import type { FilterState, SortKey, SortState, TriState } from "../types/movieTable";
export type { FilterState, SortKey, SortState, TriState };

export const defaultSortState: SortState = {
  key: "rating",
  direction: "desc",
};

export const defaultFilterState: FilterState = {
  genre: "all",
  isNetflixOriginal: "all",
  bookmarkable: "all",
};

function includeByTriState(value: boolean | undefined, triState: TriState): boolean {
  if (triState === "all") {
    return true;
  }

  if (triState === "yes") {
    return value === true;
  }

  return value === false;
}

export function filterMovies(movies: Movie[], filters: FilterState): Movie[] {
  return movies.filter((movie) => {
    const genreMatch =
      filters.genre === "all" || movie.genre.some((genre) => genre === filters.genre);
    const originalMatch = includeByTriState(movie.isNetflixOriginal, filters.isNetflixOriginal);
    const bookmarkableMatch = includeByTriState(movie.bookmarkable, filters.bookmarkable);

    return genreMatch && originalMatch && bookmarkableMatch;
  });
}

function getComparableValue(movie: Movie, key: SortKey): string | number {
  switch (key) {
    case "title":
      return movie.title.toLowerCase();
    case "director":
      return movie.director.toLowerCase();
    case "year":
      return movie.year;
    case "rating":
      return movie.rating;
    case "durationMin":
      return movie.durationMin;
    case "watchedDate":
      return new Date(movie.watchedDate).getTime();
    default:
      return movie.title.toLowerCase();
  }
}

export function sortMovies(movies: Movie[], sortState: SortState): Movie[] {
  const directionFactor = sortState.direction === "asc" ? 1 : -1;

  return [...movies].sort((a, b) => {
    const first = getComparableValue(a, sortState.key);
    const second = getComparableValue(b, sortState.key);

    if (first < second) {
      return -1 * directionFactor;
    }

    if (first > second) {
      return 1 * directionFactor;
    }

    return a.id - b.id;
  });
}

export function getGenreOptions(movies: Movie[]): string[] {
  const genres = new Set<string>();
  movies.forEach((movie) => {
    movie.genre.forEach((genre) => genres.add(genre));
  });
  return Array.from(genres).sort((a, b) => a.localeCompare(b));
}
