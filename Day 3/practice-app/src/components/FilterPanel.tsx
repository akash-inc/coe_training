type FilterPanelProps = {
  query: string
  selectedGenre: string
  genres: string[]
  onQueryChange: (value: string) => void
  onGenreChange: (value: string) => void
}

export default function FilterPanel({
  query,
  selectedGenre,
  genres,
  onQueryChange,
  onGenreChange,
}: FilterPanelProps) {
  return (
    <div className="filter-panel" role="search" aria-label="Movie filters">
      <div className="filter-field">
        <label htmlFor="card-search">Search by title, artist, album, or genre</label>
        <input
          id="card-search"
          name="cardSearch"
          type="search"
          value={query}
          onChange={event => onQueryChange(event.target.value)}
          placeholder="Type to filter..."
        />
      </div>
      <div className="filter-field">
        <label htmlFor="genre-filter">Filter by genre</label>
        <select
          id="genre-filter"
          name="genreFilter"
          value={selectedGenre}
          onChange={event => onGenreChange(event.target.value)}
        >
          <option value="all">All genres</option>
          {genres.map(genre => (
            <option key={genre} value={genre.toLowerCase()}>
              {genre}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
