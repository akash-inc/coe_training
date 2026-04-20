function getSmoothLabel({ fps, avgTimeMs }) {
  if (fps < 35 || avgTimeMs > 140) {
    return 'Janky'
  }
  if (fps < 50 || avgTimeMs > 60) {
    return 'Mixed'
  }
  return 'Smooth'
}

function PerformanceMetricsPanel({ unoptimizedMetrics, optimizedMetrics }) {
  return (
    <section className="panel playground-panel">
      <h3>Performance Metrics</h3>
      <p className="meta metrics-help">
        Quick read: lower <strong>Renders</strong> and <strong>Avg Time</strong>,
        higher <strong>FPS</strong>, and <strong>Smooth</strong> status are better.
      </p>
      <ul className="metrics-legend">
        <li>
          <strong>Renders</strong>: fewer unnecessary updates is better.
        </li>
        <li>
          <strong>Avg Time</strong>: lower operation time is better.
        </li>
        <li>
          <strong>CPU Estimate</strong>: rough relative workload only.
        </li>
        <li>
          <strong>FPS</strong>: closer to 60 usually feels smooth.
        </li>
      </ul>
      <div className="metrics-grid">
        <div>
          <h4>Unoptimized</h4>
          <p>Renders: {unoptimizedMetrics.renders}</p>
          <p>Avg Time: {unoptimizedMetrics.avgTimeMs}ms</p>
          <p>CPU Estimate: {unoptimizedMetrics.cpuPercent}%</p>
          <p>FPS: {unoptimizedMetrics.fps}</p>
          <p>Status: {getSmoothLabel(unoptimizedMetrics)}</p>
        </div>
        <div>
          <h4>Optimized</h4>
          <p>Renders: {optimizedMetrics.renders}</p>
          <p>Avg Time: {optimizedMetrics.avgTimeMs}ms</p>
          <p>CPU Estimate: {optimizedMetrics.cpuPercent}%</p>
          <p>FPS: {optimizedMetrics.fps}</p>
          <p>Status: {getSmoothLabel(optimizedMetrics)}</p>
        </div>
      </div>
    </section>
  )
}

export default PerformanceMetricsPanel
