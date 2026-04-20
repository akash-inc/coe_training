function PlaygroundControls({
  highlightRenders,
  onToggleHighlightRenders,
  cpuThrottleEnabled,
  onToggleCpuThrottle,
  onRunStressTest,
  onStartStressTest,
  onStopStressTest,
  isStressRunning,
}) {
  return (
    <section className="panel playground-panel">
      <h3>Interactive Controls</h3>
      <div className="button-row">
        <button type="button" onClick={onRunStressTest}>
          Run Once
        </button>
        {!isStressRunning ? (
          <button type="button" onClick={onStartStressTest}>
            Start Stress Test
          </button>
        ) : (
          <button type="button" onClick={onStopStressTest}>
            Stop Stress Test
          </button>
        )}
        <label className="toggle-control">
          <input
            type="checkbox"
            checked={highlightRenders}
            onChange={onToggleHighlightRenders}
          />
          Render Highlighter
        </label>
        <label className="toggle-control">
          <input
            type="checkbox"
            checked={cpuThrottleEnabled}
            onChange={onToggleCpuThrottle}
          />
          CPU Throttling
        </label>
      </div>
    </section>
  )
}

export default PlaygroundControls
