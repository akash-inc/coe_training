export type SortKey = "title" | "year" | "rating" | "durationMin" | "watchedDate" | "director";
export type SortDirection = "asc" | "desc";

export type SortState = {
  key: SortKey;
  direction: SortDirection;
};

export type TriState = "all" | "yes" | "no";

export type FilterState = {
  genre: string;
  isNetflixOriginal: TriState;
  bookmarkable: TriState;
};
