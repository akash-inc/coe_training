# Accessible Combobox - Strict Outside-In TDD Plan

This plan is intentionally strict: every implementation step is driven by a failing user-facing test first.

## Scope and Intent

Build an editable autocomplete combobox (`list` mode) that is keyboard accessible and APG-aligned.

Strict Outside-In means:

1. Start with an acceptance/integration test that models a real user journey.
2. Only add lower-level tests when the currently failing outer test demands deeper behavior.
3. Keep changes minimal, reversible, and focused on observable behavior.

## Tooling (Aligned with This Repo)

- Test runner/assertions: `Vitest`
- UI behavior tests: `React Testing Library`
- Network doubles (if async source): `MSW`
- Optional a11y assertions: `jest-axe` (only when a failing acceptance test demands stronger a11y checks)
- Optional browser-level confidence: `Playwright` as a final confidence layer, not a replacement for the outer loop

## User Story (Complete Coverage)

As a keyboard and screen-reader user, I want to type into a combobox, receive matching suggestions, navigate them, and commit a value reliably so I can complete selection quickly without losing context.

### Acceptance Criteria (All Must Be Covered)

1. Typing filters suggestions by query (case-insensitive match).
2. Popup opens when there are matching suggestions and closes when there are none or user dismisses.
3. `ArrowDown`/`ArrowUp` moves active option predictably.
4. `Enter` commits active suggestion to input and closes popup.
5. `Escape` closes popup and preserves typed text (unless product explicitly chooses clear-on-escape).
6. Mouse click on an option commits value and closes popup.
7. Blur/outside click closes popup safely.
8. `aria-expanded`, `aria-controls`, `aria-autocomplete`, and accessible name are correct.
9. Active option is exposed via `aria-activedescendant` while DOM focus remains on input.
10. Committed/active option is reflected with correct `aria-selected` semantics.
11. Async data path: loading state and error state are announced/visible and do not break keyboard flow.
12. No-results state is communicated clearly (visually and to assistive tech).
13. Required native text editing behavior remains intact (no broken standard input keys).

## Strict Outside-In Execution Plan

Outer loop target: one acceptance test per user-visible behavior slice.  
Inner loop: only introduced when a red outer test cannot be satisfied without deeper units.

### Slice 0 - Skeleton Goal Post

Write one top-level failing integration test:

- User types text
- Suggestions appear
- User navigates with keyboard
- User commits with Enter
- Value is reflected and popup closes

Do not build internals yet. Add only enough shell/seams so the failure moves inward.

### Slice 1 - First Green Path (Minimal Happy Path)

Outer test (integration): make the simplest happy path pass.

Only if needed by the outer failure:

- Add focused component-level test for rendering/open-close behavior.
- Add pure filtering test only when matching logic complexity appears.

Implement minimum code to pass, then refactor.

### Slice 2 - Keyboard Navigation Rules

Add failing outer test for:

- Down/up movement boundaries
- Enter commit
- Escape close semantics

Only then add inner tests for navigation state transitions if outer assertions are too broad to debug safely.

### Slice 3 - Pointer and Focus Loss Behavior

Add failing outer tests for:

- Click option commits
- Blur/outside click closes popup without corrupting value

Add inner tests only when needed for deterministic focus/interaction logic.

### Slice 4 - No Results and Empty Query

Add failing outer tests for:

- Query with zero matches
- Clear input transitions
- Popup visibility rules

Introduce a pure matcher/filter module test only now if behavior branches are getting dense.

### Slice 5 - ARIA Contract (Behavior-Driven)

Add failing outer tests asserting:

- Correct `role="combobox"` semantics and accessible name
- Correct `aria-expanded`, `aria-controls`, `aria-autocomplete`
- Correct `aria-activedescendant` during keyboard navigation
- Correct `role="listbox"` and `role="option"` with selection semantics

If failures are hard to localize, add focused component tests for attribute transitions.

### Slice 6 - Async Source Reliability (If Suggestions Are Remote)

Add failing outer tests for:

- Loading state while request in flight
- Error recovery path
- Success path after retry/new query

Use `MSW` to mock network behavior.  
Only after red outer failures demand it, add unit tests for data-fetch hook/service boundaries.

### Slice 7 - Regression Guardrails

Add outer tests for:

- Native input editing keys still function
- Focus remains on input while active option changes via `aria-activedescendant`

Optional: add `jest-axe` assertions if a real a11y regression is not captured by behavior tests.

## Test-First Discipline Checklist

Use this before every commit:

1. Did a test fail first for the exact behavior I implemented?
2. Did I add only the minimum code to make it pass?
3. Did I avoid writing inner tests before outer pressure existed?
4. Did I refactor without changing externally observable behavior?
5. Did I keep each change small and reversible?

## Definition of Done

Done means all acceptance criteria above are covered by passing tests, and each behavior can be traced to an outer failing test that drove the implementation inward.

## Suggested File/Test Shape

Example structure (adapt names to your project conventions):

```text
src/features/combobox/
  components/
    ComboboxFeature.jsx
    ComboboxInput.jsx
    ComboboxList.jsx
  hooks/
    useCombobox.js
  services/
    suggestionService.js            # only if async source exists
  utils/
    filterSuggestions.js            # only if demanded by tests
  Combobox.integration.test.jsx
  ComboboxInput.test.jsx            # added only when demanded
  useCombobox.test.js               # added only when demanded
  suggestionService.test.js         # added only when demanded
  filterSuggestions.test.js         # added only when demanded
```

The key rule is not the folder shape; the key rule is demand-driven movement from outer behavior to inner details.
