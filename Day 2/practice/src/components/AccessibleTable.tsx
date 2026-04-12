import type { Movie } from "../types/movie";
import type { SortKey, SortState } from "../types/movieTable";
import { useMemo } from "react";
import AccessibleTableHeader from "./AccessibleTableHeader";
import AccessibleTableRow from "./AccessibleTableRow";

type AccessibleTableProps = {
  rows: Movie[];
  caption?: string;
  sortState: SortState;
  onSortChange: (next: SortState) => void;
  onTitleClick: (movie: Movie) => void;
};

function getSortLabel(sortKey: SortKey): string {
  switch (sortKey) {
    case "title":
      return "Title";
    case "year":
      return "Year";
    case "director":
      return "Director";
    case "rating":
      return "Rating";
    case "durationMin":
      return "Duration";
    case "watchedDate":
      return "Watched Date";
    default:
      return "Title";
  }
}

export default function AccessibleTable({
  rows,
  caption = "Netflix Movies",
  sortState,
  onSortChange,
  onTitleClick,
}: AccessibleTableProps) {
  const liveStatus = useMemo(() => {
    const directionLabel = sortState.direction === "asc" ? "ascending" : "descending";
    const movieLabel = rows.length === 1 ? "movie" : "movies";
    return `Showing ${rows.length} ${movieLabel}. Sorted by ${getSortLabel(
      sortState.key,
    )}, ${directionLabel}.`;
  }, [rows.length, sortState]);

  return (
    <>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {liveStatus}
      </p>
      <table>
        <caption>{caption}</caption>
        <AccessibleTableHeader sortState={sortState} onSortChange={onSortChange} />
        <tbody>
          {rows.map((row) => (
            <AccessibleTableRow key={row.id} row={row} onTitleClick={onTitleClick} />
          ))}
        </tbody>
      </table>
    </>
  );
}
