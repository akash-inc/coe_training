# Accessible Outside-In TDD (Day 4)

Practice repository for building accessibility-first UI features using an Outside-In TDD mindset.

## Day 4 feature map

### Outside-In TDD fundamentals
- **Practice:** test user behavior first, then implementation.
- **Exercise idea (next):** Weather API kata with Outside-In TDD and dependency seams.
- **Practice:** mock external dependencies with test doubles (timers, observers, API mocks).

### Accessible component patterns implemented
- **Accessible autocomplete/combobox**
  - Component: `src/features/combobox/components/ComboboxFeature.jsx`
  - Tests: `src/features/combobox/tests/Combobox.integration.test.jsx`
- **Accessible infinite scroll with announcements**
  - Component: `src/features/infinite-scroll/components/InfiniteScrollAnnouncer.jsx`
  - Tests: `src/features/infinite-scroll/tests/InfiniteScrollAnnouncer.test.jsx`
- **Accessible charts and data visualizations (Recharts)**
  - Component: `src/features/charts/components/AccessiblePipelineChart.jsx`
  - Tests: `src/features/charts/tests/AccessiblePipelineChart.test.jsx`
  - Notes: `src/features/charts/ACCESSIBILITY.md`
- **Accessible drag-and-drop interfaces**
  - Component: `src/features/drag-drop/components/ApplicationBoard.jsx`
  - Tests: `src/features/drag-drop/tests/ApplicationBoard.test.jsx`
- **Accessible file upload with progress**
  - Component: `src/features/file-upload/components/ResumeUpload.jsx`
  - Tests: `src/features/file-upload/tests/ResumeUpload.test.jsx`
- **Accessible multi-step forms**
  - Component: `src/features/multi-step-form/components/MultiStepApplicationForm.jsx`
  - Tests: `src/features/multi-step-form/tests/MultiStepApplicationForm.integration.test.jsx`
- **Accessible error handling and recovery**
  - Included in `ResumeUpload` (`role="alert"`, retry flow, explicit reason messaging).
- **Accessible loading states and skeletons**
  - Included in `ResumeUpload` during upload progression.
- **Accessible toast notifications**
  - Included in `ResumeUpload` with status/alert semantics.
- **Mobile accessibility (touch targets + zoom)**
  - Component: `src/features/mobile-accessibility/components/AccessibleMobileImage.jsx`
  - Tests: `src/features/mobile-accessibility/tests/AccessibleMobileImage.test.jsx`
- **Accessibility testing checklist for team (WCAG 2.1 AA)**
  - Component: `src/features/accessibility-checklist/components/AccessibilityChecklist.jsx`
  - Tests: `src/features/accessibility-checklist/tests/AccessibilityChecklist.test.jsx`

### App composition
- All core features are presented together in `src/App.jsx` as a single "accessibility lab" flow.

## Super short summary (non-technical)
This app demonstrates how to build common product features so they work for everyone, including keyboard and screen-reader users.

## Learning resources
- [Inclusive Components](https://inclusive-components.design)
- [Highcharts accessibility best practices](https://www.highcharts.com/blog/best-practices/best-chart-accessibility-practices/)
- [A11y Collective: accessible charts](https://www.a11y-collective.com/blog/accessible-charts/)
- [Deque: mobile web pinch/zoom accessibility](https://www.deque.com/blog/accessibility-mobile-web-pinch-zoom-tutorial/)

