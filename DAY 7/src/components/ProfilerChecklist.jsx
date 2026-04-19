import ExerciseStatusToggle from './ExerciseStatusToggle.jsx'

function ProfilerChecklist({ isImplementedProperly, onToggleStatus }) {
  return (
    <section className="panel">
      <div className="exercise-header">
        <h3>Exercise 1 - See how slow the app is</h3>
        <ExerciseStatusToggle
          isImplementedProperly={isImplementedProperly}
          onToggleStatus={onToggleStatus}
        />
      </div>
      <p className="exercise-objective">
        Goal: learn how to measure speed using React DevTools so you know what
        to fix later.
      </p>
      <ol>
        <li>Install the React Developer Tools browser extension.</li>
        <li>Open this page, right-click, choose Inspect, and open the Profiler tab.</li>
        <li>Click the blue record (circle) button to start recording.</li>
        <li>
          Type a few letters in the search box inside Exercise 9 (the input field
          with placeholder text).
        </li>
        <li>Click the record button again to stop.</li>
        <li>Look at the bars. Bigger bars mean slower parts of the app.</li>
      </ol>
      <p className="meta">
        Tip: take a screenshot of the result. That is your &quot;before&quot;
        picture. Later you will compare it with the &quot;after&quot;.
      </p>
    </section>
  )
}

export default ProfilerChecklist
