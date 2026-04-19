function ExerciseStatusGuidePanel() {
  return (
    <section className="panel">
      <div className="exercise-header">
        <h3>Exercise status guide</h3>
      </div>
      <p className="exercise-objective">
        Each exercise has its own red/green toggle now:
      </p>
      <ul className="exercise-objective">
        <li>
          <strong>Red</strong> = not fixed yet.
        </li>
        <li>
          <strong>Green</strong> = fixed and implemented properly.
        </li>
      </ul>
    </section>
  )
}

export default ExerciseStatusGuidePanel
