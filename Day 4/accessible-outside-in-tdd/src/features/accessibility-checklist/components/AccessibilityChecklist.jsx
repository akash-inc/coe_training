import { useMemo, useState } from 'react'
import './AccessibilityChecklist.css'

const WCAG_21_AA_CHECKLIST = [
  {
    group: 'Perceivable',
    items: [
      { id: 'text-alternatives', criterion: '1.1.1', title: 'Text alternatives for non-text content' },
      { id: 'captions-prerecorded', criterion: '1.2.2', title: 'Captions for prerecorded video with audio' },
      { id: 'audio-description', criterion: '1.2.5', title: 'Audio description for prerecorded video' },
      { id: 'info-relationships', criterion: '1.3.1', title: 'Semantic structure conveys relationships' },
      { id: 'meaningful-sequence', criterion: '1.3.2', title: 'Reading sequence remains meaningful' },
      { id: 'sensory-characteristics', criterion: '1.3.3', title: 'Instructions do not rely only on sensory cues' },
      { id: 'orientation', criterion: '1.3.4', title: 'Content works in portrait and landscape' },
      { id: 'input-purpose', criterion: '1.3.5', title: 'Input purpose is programmatically identified' },
      { id: 'use-of-color', criterion: '1.4.1', title: 'Color is not the only way to convey meaning' },
      { id: 'contrast-minimum', criterion: '1.4.3', title: 'Text contrast meets minimum ratios' },
      { id: 'resize-text', criterion: '1.4.4', title: 'Text can resize to 200% without loss of content' },
      { id: 'images-of-text', criterion: '1.4.5', title: 'Avoid images of text where possible' },
      { id: 'reflow', criterion: '1.4.10', title: 'Content reflows at 320px CSS width' },
      { id: 'non-text-contrast', criterion: '1.4.11', title: 'UI components and graphics have enough contrast' },
      { id: 'text-spacing', criterion: '1.4.12', title: 'Custom text spacing does not break content' },
      { id: 'hover-focus-content', criterion: '1.4.13', title: 'Hover/focus content is dismissible and persistent' },
    ],
  },
  {
    group: 'Operable',
    items: [
      { id: 'keyboard', criterion: '2.1.1', title: 'All functionality works with keyboard' },
      { id: 'no-keyboard-trap', criterion: '2.1.2', title: 'No keyboard trap exists' },
      { id: 'character-key-shortcuts', criterion: '2.1.4', title: 'Single-key shortcuts are configurable or limited' },
      { id: 'timing-adjustable', criterion: '2.2.1', title: 'Users can extend or disable time limits' },
      { id: 'pause-stop-hide', criterion: '2.2.2', title: 'Moving content can be paused, stopped, or hidden' },
      { id: 'three-flashes', criterion: '2.3.1', title: 'No content flashes more than three times per second' },
      { id: 'bypass-blocks', criterion: '2.4.1', title: 'Skip links or bypass mechanisms are present' },
      { id: 'page-titled', criterion: '2.4.2', title: 'Each page has a descriptive title' },
      { id: 'focus-order', criterion: '2.4.3', title: 'Focus order matches visual and logical flow' },
      { id: 'link-purpose', criterion: '2.4.4', title: 'Link purpose is clear from text/context' },
      { id: 'multiple-ways', criterion: '2.4.5', title: 'Multiple ways exist to find major pages' },
      { id: 'headings-labels', criterion: '2.4.6', title: 'Headings and labels are descriptive' },
      { id: 'focus-visible', criterion: '2.4.7', title: 'Visible keyboard focus indicator is always present' },
      { id: 'pointer-gestures', criterion: '2.5.1', title: 'Complex gestures have simple alternatives' },
      { id: 'pointer-cancellation', criterion: '2.5.2', title: 'Pointer actions support cancellation' },
      { id: 'label-in-name', criterion: '2.5.3', title: 'Accessible name includes visible label text' },
      { id: 'motion-actuation', criterion: '2.5.4', title: 'Motion-triggered actions have non-motion alternatives' },
    ],
  },
  {
    group: 'Understandable',
    items: [
      { id: 'language-page', criterion: '3.1.1', title: 'Primary page language is defined' },
      { id: 'language-parts', criterion: '3.1.2', title: 'Language changes in content are identified' },
      { id: 'on-focus', criterion: '3.2.1', title: 'Focus does not trigger unexpected context changes' },
      { id: 'on-input', criterion: '3.2.2', title: 'Input changes do not trigger unexpected context changes' },
      { id: 'consistent-navigation', criterion: '3.2.3', title: 'Repeated navigation stays consistent' },
      { id: 'consistent-identification', criterion: '3.2.4', title: 'Same components are identified consistently' },
      { id: 'error-identification', criterion: '3.3.1', title: 'Validation errors are clearly identified' },
      { id: 'labels-instructions', criterion: '3.3.2', title: 'Inputs include labels and instructions' },
      { id: 'error-suggestion', criterion: '3.3.3', title: 'Error suggestions are provided when possible' },
      { id: 'error-prevention', criterion: '3.3.4', title: 'Critical submissions include prevention/review/confirmation' },
    ],
  },
  {
    group: 'Robust',
    items: [
      { id: 'parsing', criterion: '4.1.1', title: 'Markup is complete and properly nested' },
      { id: 'name-role-value', criterion: '4.1.2', title: 'Custom UI exposes Name, Role, and Value' },
      { id: 'status-messages', criterion: '4.1.3', title: 'Status updates are announced without focus changes' },
    ],
  },
]

const ALL_ITEMS = WCAG_21_AA_CHECKLIST.flatMap((group) => group.items)

export function AccessibilityChecklist() {
  const [completedById, setCompletedById] = useState({})
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(false)

  const completedCount = useMemo(
    () => ALL_ITEMS.filter((item) => completedById[item.id]).length,
    [completedById],
  )

  const progressPercent = Math.round((completedCount / ALL_ITEMS.length) * 100)

  const handleToggleItem = (itemId) => {
    setCompletedById((currentState) => ({
      ...currentState,
      [itemId]: !currentState[itemId],
    }))
  }

  return (
    <section className="accessibility-checklist" aria-labelledby="accessibility-checklist-title">
      <header className="accessibility-checklist__header">
        <div>
          <h2 id="accessibility-checklist-title">WCAG 2.1 AA team checklist</h2>
          <p>Use this todo checklist during design, development, QA, and release readiness.</p>
        </div>
        <div className="accessibility-checklist__progress" role="status" aria-live="polite">
          <strong>{completedCount}</strong> / {ALL_ITEMS.length} complete ({progressPercent}%)
        </div>
      </header>

      <label className="accessibility-checklist__filter" htmlFor="incomplete-only-toggle">
        <input
          id="incomplete-only-toggle"
          type="checkbox"
          checked={showIncompleteOnly}
          onChange={(event) => setShowIncompleteOnly(event.target.checked)}
        />
        Show incomplete items only
      </label>

      <div className="accessibility-checklist__groups">
        {WCAG_21_AA_CHECKLIST.map((group) => {
          const visibleItems = group.items.filter(
            (item) => !showIncompleteOnly || !completedById[item.id],
          )

          return (
            <section
              key={group.group}
              className="accessibility-checklist__group"
              aria-labelledby={`${group.group.toLowerCase()}-group-title`}
            >
              <h3 id={`${group.group.toLowerCase()}-group-title`}>{group.group}</h3>
              {visibleItems.length === 0 ? (
                <p className="accessibility-checklist__empty">All items complete in this section.</p>
              ) : (
                <ul>
                  {visibleItems.map((item) => (
                    <li key={item.id}>
                      <label>
                        <input
                          type="checkbox"
                          checked={Boolean(completedById[item.id])}
                          onChange={() => handleToggleItem(item.id)}
                        />
                        <span className="accessibility-checklist__item-content">
                          <span className="accessibility-checklist__item-title">{item.title}</span>
                          <span className="accessibility-checklist__criterion">
                            WCAG {item.criterion}
                          </span>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )
        })}
      </div>
    </section>
  )
}
