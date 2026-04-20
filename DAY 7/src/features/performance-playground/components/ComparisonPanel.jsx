function ComparisonPanel({
  title,
  description,
  badStats,
  goodStats,
  badPane,
  goodPane,
}) {
  return (
    <section className="panel playground-panel">
      <h3>{title}</h3>
      <p className="exercise-objective">{description}</p>

      <div className="comparison-grid">
        <div className="comparison-pane bad-pane">
          <header>
            <strong>Unoptimized</strong>
          </header>
          <p className="meta">
            Renders: {badStats.renders} | Time: {badStats.timeMs}ms
          </p>
          {badPane}
        </div>
        <div className="comparison-pane good-pane">
          <header>
            <strong>Optimized</strong>
          </header>
          <p className="meta">
            Renders: {goodStats.renders} | Time: {goodStats.timeMs}ms
          </p>
          {goodPane}
        </div>
      </div>
    </section>
  )
}

export default ComparisonPanel
