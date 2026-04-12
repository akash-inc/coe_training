import type { SortKey, SortState } from "../types/movieTable";

const HEADER_CELLS: HeaderCell[] = [
  { label: "Title", sortKey: "title" },
  { label: "Year", sortKey: "year" },
  { label: "Genre" },
  { label: "Director", sortKey: "director" },
  { label: "Rating", sortKey: "rating" },
  { label: "Duration", sortKey: "durationMin" },
  { label: "Is Netflix Original" },
  { label: "Watched Date", sortKey: "watchedDate" },
  { label: "Link" },
];

export type HeaderCell = {
  label: string;
  sortKey?: SortKey;
};

type AccessibleTableHeaderProps = {
  sortState: SortState;
  onSortChange: (next: SortState) => void;
};

export default function AccessibleTableHeader({
  sortState,
  onSortChange,
}: AccessibleTableHeaderProps) {
  function getAriaSort(key: SortKey): "ascending" | "descending" | "none" {
    if (sortState.key !== key) {
      return "none";
    }
    return sortState.direction === "asc" ? "ascending" : "descending";
  }

  function getSortIndicator(key: SortKey): string {
    if (sortState.key !== key) {
      return "";
    }
    return sortState.direction === "asc" ? " ▲" : " ▼";
  }

  function handleSort(key: SortKey): void {
    if (sortState.key === key) {
      onSortChange({
        key,
        direction: sortState.direction === "asc" ? "desc" : "asc",
      });
      return;
    }

    onSortChange({ key, direction: "asc" });
  }

  return (
    <thead>
      <tr>
        {HEADER_CELLS.map((cell) => (
          <th
            key={cell.label}
            scope="col"
            aria-sort={cell.sortKey ? getAriaSort(cell.sortKey) : undefined}
          >
            {cell.sortKey ? (
              <button
                type="button"
                className="sortable-header"
                onClick={() => {
                  if (cell.sortKey) {
                    handleSort(cell.sortKey);
                  }
                }}
              >
                {cell.label}
                {getSortIndicator(cell.sortKey)}
              </button>
            ) : (
              cell.label
            )}
          </th>
        ))}
      </tr>
    </thead>
  );
}
