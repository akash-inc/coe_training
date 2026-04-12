import type { Movie } from "../types/movie";
import type { FilterState, SortState } from "../types/movieTable";
import {
  defaultFilterState,
  defaultSortState,
  filterMovies,
  getGenreOptions,
  sortMovies,
} from "../utils/movieTable";
import { useMemo, useState } from "react";
import AccessibleTable from "./AccessibleTable";
import MovieDetailModal from "./MovieDetailModal";
import TableFilters from "./TableFilters";

type MovieTableSectionProps = {
  movies: Movie[];
};

export default function MovieTableSection({ movies }: MovieTableSectionProps) {
  const [filters, setFilters] = useState<FilterState>(defaultFilterState);
  const [sortState, setSortState] = useState<SortState>(defaultSortState);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const genreOptions = useMemo(() => getGenreOptions(movies), [movies]);
  const visibleRows = useMemo(() => {
    const filtered = filterMovies(movies, filters);
    return sortMovies(filtered, sortState);
  }, [movies, filters, sortState]);

  return (
    <>
      <TableFilters filters={filters} genreOptions={genreOptions} onChange={setFilters} />
      <AccessibleTable
        rows={visibleRows}
        sortState={sortState}
        onSortChange={setSortState}
        onTitleClick={setSelectedMovie}
      />
      <MovieDetailModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
    </>
  );
}
