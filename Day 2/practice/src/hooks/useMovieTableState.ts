import { useMemo, useState } from "react";
import type { Movie } from "../types/movie";
import type { FilterState, SortState } from "../types/movieTable";
import {
  defaultFilterState,
  defaultSortState,
  filterMovies,
  getGenreOptions,
  sortMovies,
} from "../utils/movieTable";

type UseMovieTableStateResult = {
  filters: FilterState;
  setFilters: (next: FilterState) => void;
  sortState: SortState;
  setSortState: (next: SortState) => void;
  selectedMovie: Movie | null;
  setSelectedMovie: (movie: Movie | null) => void;
  genreOptions: string[];
  visibleRows: Movie[];
};

export function useMovieTableState(movies: Movie[]): UseMovieTableStateResult {
  const [filters, setFilters] = useState<FilterState>(defaultFilterState);
  const [sortState, setSortState] = useState<SortState>(defaultSortState);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const genreOptions = useMemo(() => getGenreOptions(movies), [movies]);
  const visibleRows = useMemo(() => {
    const filtered = filterMovies(movies, filters);
    return sortMovies(filtered, sortState);
  }, [movies, filters, sortState]);

  return {
    filters,
    setFilters,
    sortState,
    setSortState,
    selectedMovie,
    setSelectedMovie,
    genreOptions,
    visibleRows,
  };
}
