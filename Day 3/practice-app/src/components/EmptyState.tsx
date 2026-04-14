type EmptyStateProps = {
  onResetFilters: () => void
}

export default function EmptyState({ onResetFilters }: EmptyStateProps) {
  return (
    <div className="empty-state" role="status" aria-live="polite">
      <h3>No cards match your filters</h3>
      <p>Try a different search term or reset filters to view all music cards.</p>
      <button type="button" className="button-secondary" onClick={onResetFilters}>
        Reset filters
      </button>
    </div>
  )
}
