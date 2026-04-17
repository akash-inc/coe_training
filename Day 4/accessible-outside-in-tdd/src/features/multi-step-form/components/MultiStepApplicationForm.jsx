import { useState } from 'react'

export default function MultiStepApplicationForm() {
  const [step, setStep] = useState(1)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    desiredRole: '',
    workType: '',
    expectedSalary: '',
    linkedin: '',
    summary: '',
  })

  if (step === 4) {
    return (
      <section aria-labelledby="step-title">
        <h2 id="step-title">Review</h2>
        <div role="status" aria-live="polite">
          {isSubmitted ? 'Application submitted' : 'Step 4 of 4'}
        </div>

        <p>{formData.fullName}</p>
        <p>{formData.email}</p>
        <p>{formData.desiredRole}</p>

        <button type="button" onClick={() => setIsSubmitted(true)}>
          Submit
        </button>
      </section>
    )
  }

  if (step === 3) {
    return (
      <section aria-labelledby="step-title">
        <h2 id="step-title">Resume details</h2>
        <div role="status" aria-live="polite">
          Step 3 of 4
        </div>

        <label htmlFor="linkedin">LinkedIn</label>
        <input
          id="linkedin"
          name="linkedin"
          type="text"
          value={formData.linkedin}
          onChange={(event) =>
            setFormData((currentData) => ({
              ...currentData,
              linkedin: event.target.value,
            }))
          }
        />

        <label htmlFor="summary">Summary</label>
        <textarea
          id="summary"
          name="summary"
          value={formData.summary}
          onChange={(event) =>
            setFormData((currentData) => ({
              ...currentData,
              summary: event.target.value,
            }))
          }
        />

        <button type="button" onClick={() => setStep(4)}>
          Next
        </button>
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
        <input
          id="desired-role"
          name="desiredRole"
          type="text"
          value={formData.desiredRole}
          onChange={(event) =>
            setFormData((currentData) => ({
              ...currentData,
              desiredRole: event.target.value,
            }))
          }
        />

        <label htmlFor="work-type">Work type</label>
        <select
          id="work-type"
          name="workType"
          value={formData.workType}
          onChange={(event) =>
            setFormData((currentData) => ({
              ...currentData,
              workType: event.target.value,
            }))
          }
        >
          <option value="" disabled>
            Select work type
          </option>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
          <option value="onsite">Onsite</option>
        </select>

        <label htmlFor="expected-salary">Expected salary</label>
        <input
          id="expected-salary"
          name="expectedSalary"
          type="text"
          value={formData.expectedSalary}
          onChange={(event) =>
            setFormData((currentData) => ({
              ...currentData,
              expectedSalary: event.target.value,
            }))
          }
        />

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
      <input
        id="full-name"
        name="fullName"
        type="text"
        value={formData.fullName}
        onChange={(event) =>
          setFormData((currentData) => ({
            ...currentData,
            fullName: event.target.value,
          }))
        }
      />

      <label htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        value={formData.email}
        onChange={(event) =>
          setFormData((currentData) => ({
            ...currentData,
            email: event.target.value,
          }))
        }
      />

      <label htmlFor="phone">Phone</label>
      <input
        id="phone"
        name="phone"
        type="tel"
        value={formData.phone}
        onChange={(event) =>
          setFormData((currentData) => ({
            ...currentData,
            phone: event.target.value,
          }))
        }
      />

      <button type="button" onClick={() => setStep(2)}>
        Next
      </button>
    </section>
  )
}