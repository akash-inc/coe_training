function SkeletonCard() {
  return (
    <div className="card skeleton" aria-hidden="true">
      <div className="sk-line sk-meta" />
      <div className="sk-line sk-title" />
      <div className="sk-line sk-summary" />
      <div className="sk-line sk-summary sk-short" />
    </div>
  )
}

// Shown as the Suspense fallback while a feed's data is in flight.
export default function SkeletonList({ count = 6 }) {
  return (
    <div className="feed-list" aria-busy="true" aria-label="Loading feed">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
