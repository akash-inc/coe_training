import { useMemo, useState } from 'react'
import { ComboboxInput } from './ComboboxInput'
import { ComboboxList } from './ComboboxList'

const JOB_ROLE_SUGGESTIONS = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Engineer',
  'QA Engineer',
]

export function ComboboxFeature() {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isListOpen, setIsListOpen] = useState(false)

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return []
    }

    return JOB_ROLE_SUGGESTIONS.filter((role) =>
      role.toLowerCase().includes(normalizedQuery),
    )
  }, [query])

  const hasOptions = filteredOptions.length > 0
  const isExpanded = isListOpen && hasOptions
  const visibleOptions = isExpanded ? filteredOptions : []
  const activeDescendantId =
    isExpanded && activeIndex >= 0 ? `job-role-option-${activeIndex}` : undefined

  const handleChange = (event) => {
    const nextQuery = event.target.value
    setQuery(nextQuery)
    setActiveIndex(-1)
    setIsListOpen(nextQuery.trim().length > 0)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown' && hasOptions) {
      event.preventDefault()
      setIsListOpen(true)
      setActiveIndex((currentIndex) =>
        currentIndex < filteredOptions.length - 1
          ? currentIndex + 1
          : filteredOptions.length - 1,
      )
    }

    if (event.key === 'Enter' && isExpanded && activeIndex >= 0) {
      event.preventDefault()
      setQuery(filteredOptions[activeIndex])
      setIsListOpen(false)
      setActiveIndex(-1)
    }
  }

  return (
    <section>
      <ComboboxInput
        inputId="job-role-search"
        label="Search roles"
        value={query}
        isExpanded={isExpanded}
        controlsId="job-role-list"
        activeDescendantId={activeDescendantId}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <ComboboxList
        listboxId="job-role-list"
        optionIdPrefix="job-role-option"
        options={visibleOptions}
        activeIndex={activeIndex}
      />
    </section>
  )
}
