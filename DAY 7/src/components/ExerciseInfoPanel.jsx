import ExerciseStatusToggle from './ExerciseStatusToggle.jsx'

function ExerciseInfoPanel({
  title,
  description,
  isImplementedProperly,
  onToggleStatus,
}) {
  return (
    <section className="panel">
      <div className="exercise-header">
        <h3>{title}</h3>
        <ExerciseStatusToggle
          isImplementedProperly={isImplementedProperly}
          onToggleStatus={onToggleStatus}
        />
      </div>
      <p className="exercise-objective">{description}</p>
    </section>
  )
}

export default ExerciseInfoPanel
