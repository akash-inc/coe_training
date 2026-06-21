// Rendered by an ErrorBoundary when a single feed throws. Because each panel
// has its own boundary, one source failing (e.g. GitHub rate-limit) leaves the
// other tabs fully working. Retry resets the boundary AND the query.
export default function FeedErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="feed-status feed-error" role="alert">
      <p>This feed couldn’t load.</p>
      <p className="error-detail">{error.message}</p>
      <button className="retry-btn" onClick={resetErrorBoundary}>
        Retry
      </button>
    </div>
  )
}
