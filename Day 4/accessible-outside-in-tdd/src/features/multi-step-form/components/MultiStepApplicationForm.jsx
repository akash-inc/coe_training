import { useMemo, useState } from 'react'
import { ComboboxInput } from '../../combobox/components/ComboboxInput'
import { ComboboxList } from '../../combobox/components/ComboboxList'
import '../../combobox/components/ComboboxFeature.css'
import './MultiStepApplicationForm.css'

const ROLE_SUGGESTIONS = [
  'Frontend Engineer',
  'Backend Engineer',
  'Full Stack Engineer',
  'Accessibility Engineer',
  'Product Designer',
]

function StepShell({ title, statusText, children, actionLabel, onAction }) {
  return (
    <section className="multi-step-form" aria-labelledby="step-title">
      <h2 className="multi-step-form__title" id="step-title">
        {title}
      </h2>
      <div className="multi-step-form__status" role="status" aria-live="polite">
        {statusText}
      </div>
      {children}
      {actionLabel && (
        <button className="multi-step-form__button" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </section>
  )
}

function TextField({ id, label, value, onChange, type = 'text', textarea = false }) {
  return (
    <>
      <label className="multi-step-form__label" htmlFor={id}>
        {label}
      </label>
      {textarea ? (
        <textarea
          className="multi-step-form__input multi-step-form__input--textarea"
          id={id}
          name={id}
          value={value}
          onChange={onChange}
        />
      ) : (
        <input
          className="multi-step-form__input"
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
        />
      )}
    </>
  )
}

function SelectField({ id, label, value, onChange, options }) {
  return (
    <>
      <label className="multi-step-form__label" htmlFor={id}>
        {label}
      </label>
      <select className="multi-step-form__input" id={id} name={id} value={value} onChange={onChange}>
        <option value="" disabled>
          Select {label.toLowerCase()}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </>
  )
}

export default function MultiStepApplicationForm({ onSubmit = () => {} }) {
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

  const [roleActiveIndex, setRoleActiveIndex] = useState(-1)
  const [isRoleListOpen, setIsRoleListOpen] = useState(false)

  const roleOptions = useMemo(() => {
    const query = formData.desiredRole.trim().toLowerCase()
    if (!query) {
      return []
    }

    return ROLE_SUGGESTIONS.filter((role) => role.toLowerCase().includes(query))
  }, [formData.desiredRole])

  const isRoleExpanded = isRoleListOpen && roleOptions.length > 0
  const activeRoleDescendantId =
    isRoleExpanded && roleActiveIndex >= 0 ? `desired-role-option-${roleActiveIndex}` : undefined

  const updateField = (field, value) => {
    setFormData((currentData) => ({
      ...currentData,
      [field]: value,
    }))
  }

  const handleDesiredRoleChange = (event) => {
    updateField('desiredRole', event.target.value)
    setRoleActiveIndex(-1)
    setIsRoleListOpen(event.target.value.trim().length > 0)
  }

  const handleDesiredRoleKeyDown = (event) => {
    if (event.key === 'ArrowDown' && roleOptions.length > 0) {
      event.preventDefault()
      setIsRoleListOpen(true)
      setRoleActiveIndex((currentIndex) =>
        currentIndex < roleOptions.length - 1 ? currentIndex + 1 : roleOptions.length - 1,
      )
      return
    }

    if (event.key === 'Enter' && isRoleExpanded && roleActiveIndex >= 0) {
      event.preventDefault()
      updateField('desiredRole', roleOptions[roleActiveIndex])
      setIsRoleListOpen(false)
      setRoleActiveIndex(-1)
    }
  }

  if (step === 4) {
    return (
      <StepShell
        title="Review"
        statusText={isSubmitted ? 'Application submitted' : 'Step 4 of 4'}
        actionLabel={isSubmitted ? null : 'Submit'}
        onAction={() => {
          setIsSubmitted(true)
          onSubmit(formData)
        }}
      >
        <div className="multi-step-form__review">
          <p>{formData.fullName}</p>
          <p>{formData.email}</p>
          <p>{formData.desiredRole}</p>
        </div>
      </StepShell>
    )
  }

  if (step === 3) {
    return (
      <StepShell title="Resume details" statusText="Step 3 of 4" actionLabel="Next" onAction={() => setStep(4)}>
        <TextField
          id="linkedin"
          label="LinkedIn"
          value={formData.linkedin}
          onChange={(event) => updateField('linkedin', event.target.value)}
        />
        <TextField
          id="summary"
          label="Summary"
          value={formData.summary}
          onChange={(event) => updateField('summary', event.target.value)}
          textarea
        />
      </StepShell>
    )
  }

  if (step === 2) {
    return (
      <StepShell title="Role preferences" statusText="Step 2 of 4" actionLabel="Next" onAction={() => setStep(3)}>
        <div className="multi-step-form__combobox">
          <ComboboxInput
            inputId="desired-role"
            label="Desired role"
            value={formData.desiredRole}
            isExpanded={isRoleExpanded}
            controlsId="desired-role-list"
            activeDescendantId={activeRoleDescendantId}
            onChange={handleDesiredRoleChange}
            onKeyDown={handleDesiredRoleKeyDown}
          />
          <ComboboxList
            listboxId="desired-role-list"
            optionIdPrefix="desired-role-option"
            options={isRoleExpanded ? roleOptions : []}
            activeIndex={roleActiveIndex}
          />
        </div>

        <SelectField
          id="work-type"
          label="Work type"
          value={formData.workType}
          onChange={(event) => updateField('workType', event.target.value)}
          options={[
            { label: 'Remote', value: 'remote' },
            { label: 'Hybrid', value: 'hybrid' },
            { label: 'Onsite', value: 'onsite' },
          ]}
        />
        <TextField
          id="expected-salary"
          label="Expected salary"
          value={formData.expectedSalary}
          onChange={(event) => updateField('expectedSalary', event.target.value)}
        />
      </StepShell>
    )
  }

  return (
    <StepShell title="Personal details" statusText="Step 1 of 4" actionLabel="Next" onAction={() => setStep(2)}>
      <TextField
        id="full-name"
        label="Full name"
        value={formData.fullName}
        onChange={(event) => updateField('fullName', event.target.value)}
      />
      <TextField
        id="email"
        label="Email"
        type="email"
        value={formData.email}
        onChange={(event) => updateField('email', event.target.value)}
      />
      <TextField
        id="phone"
        label="Phone"
        type="tel"
        value={formData.phone}
        onChange={(event) => updateField('phone', event.target.value)}
      />
    </StepShell>
  )
}