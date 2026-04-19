function ExerciseStatusToggle({ isImplementedProperly, onToggleStatus }) {
  return (
    <button
      type="button"
      className={`status-toggle ${isImplementedProperly ? 'is-good' : 'is-bad'}`}
      onClick={onToggleStatus}
    >
      {isImplementedProperly ? 'Fixed (Green)' : 'Not fixed (Red)'}
    </button>
  )
}

export default ExerciseStatusToggle
