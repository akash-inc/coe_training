import type { FilterState, TriState } from "../types/movieTable";

type TableFiltersProps = {
  filters: FilterState;
  genreOptions: string[];
  onChange: (next: FilterState) => void;
};

function updateTriState(
  filters: FilterState,
  key: "isNetflixOriginal" | "bookmarkable",
  value: string,
): FilterState {
  const triState: TriState = value === "yes" || value === "no" ? value : "all";
  return { ...filters, [key]: triState };
}

export default function TableFilters({ filters, genreOptions, onChange }: TableFiltersProps) {
  return (
    <section className="filter-toolbar" aria-label="Movie filters">
      <label>
        Genre
        <select
          value={filters.genre}
          onChange={(event) => onChange({ ...filters, genre: event.target.value })}
        >
          <option value="all">All</option>
          {genreOptions.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </label>

      <label>
        Netflix Original
        <select
          value={filters.isNetflixOriginal}
          onChange={(event) =>
            onChange(updateTriState(filters, "isNetflixOriginal", event.target.value))
          }
        >
          <option value="all">All</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </label>

      <label>
        Bookmarkable
        <select
          value={filters.bookmarkable}
          onChange={(event) => onChange(updateTriState(filters, "bookmarkable", event.target.value))}
        >
          <option value="all">All</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </label>
    </section>
  );
}
