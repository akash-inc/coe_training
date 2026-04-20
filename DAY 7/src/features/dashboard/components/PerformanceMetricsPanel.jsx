function PerformanceMetricsPanel({
  totalProducts,
  filteredCount,
  visibleCount,
  favoritesCount,
  filterDurationMs,
  renderSnapshot,
  onClearMetrics,
}) {
  const dashboardRowsRendered =
    renderSnapshot.find((entry) => entry.component === 'DashboardProductRow')
      ?.count ?? 0

  return (
    <section className="panel dashboard-panel">
      <h3>Performance Metrics</h3>
      <dl className="stats-grid">
        <div>
          <dt>Total products</dt>
          <dd>{totalProducts}</dd>
        </div>
        <div>
          <dt>Filtered products</dt>
          <dd>{filteredCount}</dd>
        </div>
        <div>
          <dt>Visible rows</dt>
          <dd>{visibleCount}</dd>
        </div>
        <div>
          <dt>Favorites</dt>
          <dd>{favoritesCount}</dd>
        </div>
        <div>
          <dt>Filter compute time</dt>
          <dd>{filterDurationMs}ms</dd>
        </div>
        <div>
          <dt>Row render count</dt>
          <dd>{dashboardRowsRendered}</dd>
        </div>
      </dl>
      <div className="button-row">
        <button type="button" onClick={onClearMetrics}>
          Reset metrics
        </button>
      </div>
    </section>
  )
}

export default PerformanceMetricsPanel
