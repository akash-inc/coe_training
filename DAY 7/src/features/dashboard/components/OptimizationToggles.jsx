function OptimizationToggles({ toggles, onToggleChange }) {
  return (
    <section className="panel dashboard-panel">
      <h3>Optimization Toggles</h3>
      <p className="exercise-objective">
        Enable or disable optimizations to compare behavior and metrics.
      </p>
      <div className="toggle-grid">
        {Object.entries(toggles).map(([key, enabled]) => (
          <label key={key} className="toggle-item">
            <input
              type="checkbox"
              checked={enabled}
              onChange={() => onToggleChange(key)}
            />
            <span>{key}</span>
          </label>
        ))}
      </div>
    </section>
  )
}

export default OptimizationToggles
