import type { Movie } from "../types/movie";
import { useMovieTableState } from "../hooks/useMovieTableState";
import AccessibleTable from "./AccessibleTable";
import MovieDetailModal from "./MovieDetailModal";
import TableFilters from "./TableFilters";

type MovieTableSectionProps = {
  movies: Movie[];
};

export default function MovieTableSection({ movies }: MovieTableSectionProps) {
  const {
    filters,
    setFilters,
    sortState,
    setSortState,
    selectedMovie,
    setSelectedMovie,
    genreOptions,
    visibleRows,
  } = useMovieTableState(movies);

  return (
    <section className="movie-table-section" aria-label="Movie library table">
      <header className="movie-table-section-header">
        <h2>Movie Library</h2>
        <p>
          {visibleRows.length} result{visibleRows.length === 1 ? "" : "s"} from {movies.length} movies
        </p>
      </header>
      <TableFilters filters={filters} genreOptions={genreOptions} onChange={setFilters} />
      <AccessibleTable
        rows={visibleRows}
        sortState={sortState}
        onSortChange={setSortState}
        onTitleClick={setSelectedMovie}
      />
      <MovieDetailModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
    </section>
  );
}
