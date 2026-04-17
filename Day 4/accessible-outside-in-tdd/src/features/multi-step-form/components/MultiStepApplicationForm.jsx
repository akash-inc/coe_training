import { useState } from 'react'

export default function MultiStepApplicationForm() {
  const [step, setStep] = useState(1)

  if (step === 3) {
    return (
      <section aria-labelledby="step-title">
        <h2 id="step-title">Resume details</h2>
        <div role="status" aria-live="polite">
          Step 3 of 4
        </div>

        <label htmlFor="linkedin">LinkedIn</label>
        <input id="linkedin" name="linkedin" type="text" />

        <label htmlFor="summary">Summary</label>
        <textarea id="summary" name="summary" />

        <button type="button">Next</button>
      </section>
    )
  }

  if (step === 2) {
    return (
      <section aria-labelledby="step-title">
        <h2 id="step-title">Role preferences</h2>
        <div role="status" aria-live="polite">
          Step 2 of 4
        </div>

        <label htmlFor="desired-role">Desired role</label>
        <input id="desired-role" name="desiredRole" type="text" />

        <label htmlFor="work-type">Work type</label>
        <select id="work-type" name="workType" defaultValue="">
          <option value="" disabled>
            Select work type
          </option>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
          <option value="onsite">Onsite</option>
        </select>

        <label htmlFor="expected-salary">Expected salary</label>
        <input id="expected-salary" name="expectedSalary" type="text" />

        <button type="button" onClick={() => setStep(3)}>
          Next
        </button>
      </section>
    )
  }

  return (
    <section aria-labelledby="step-title">
      <h2 id="step-title">Personal details</h2>
      <div role="status" aria-live="polite">
        Step 1 of 4
      </div>

      <label htmlFor="full-name">Full name</label>
      <input id="full-name" name="fullName" type="text" />

      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" />

      <label htmlFor="phone">Phone</label>
      <input id="phone" name="phone" type="tel" />

      <button type="button" onClick={() => setStep(2)}>
        Next
      </button>
    </section>
  )
}