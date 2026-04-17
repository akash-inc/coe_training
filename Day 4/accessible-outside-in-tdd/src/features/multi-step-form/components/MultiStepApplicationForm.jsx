export default function MultiStepApplicationForm() {
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

      <button type="button">Next</button>
    </section>
  )
}