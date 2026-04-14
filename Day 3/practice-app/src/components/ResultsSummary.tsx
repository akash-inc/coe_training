type ResultsSummaryProps = {
  total: number
  filtered: number
  query: string
  selectedGenre: string
}

export default function ResultsSummary({
  total,
  filtered,
  query,
  selectedGenre,
}: ResultsSummaryProps) {
  const usingFilters = query.trim() !== '' || selectedGenre !== 'all'

  return (
    <p className="results-summary" role="status" aria-live="polite">
      Showing {filtered} of {total} cards
      {usingFilters ? (
        <>
          {' '}
          for query <strong>{query.trim() === '' ? '(none)' : query.trim()}</strong> and genre{' '}
          <strong>{selectedGenre === 'all' ? 'all genres' : selectedGenre}</strong>.
        </>
      ) : (
        '.'
      )}
    </p>
  )
}
