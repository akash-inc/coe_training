# AccessiblePipelineChart Accessibility Notes

## Super short summary (non-technical)
This chart is accessible because it does not rely only on visuals. People can understand the same information through clear text, keyboard controls, and a readable data table.

## Component covered
- `AccessiblePipelineChart` in `src/features/charts/components/AccessiblePipelineChart.jsx`

## Accessibility goals
- Give users a quick text explanation of what the chart means.
- Ensure assistive technologies can identify the chart region.
- Provide a non-visual equivalent of chart data.
- Keep the experience fully usable with keyboard only.
- Avoid confusing or empty chart output when there is no data.

## How accessibility is implemented

### 1) Structural semantics
- The chart is wrapped in a `section` with `aria-labelledby`.
- A visible heading is rendered and associated to the section via `useId()`.
- This creates a strong, navigable structure for screen-reader users.

### 2) Chart has an explicit accessible name
- The visual chart wrapper uses `role="img"` and
  `aria-label="Bar chart showing applications by pipeline stage"`.
- This gives a concise description for users who cannot interpret the graphic.
- The inner Recharts canvas output is marked `aria-hidden="true"` so only the purposeful accessible layer is exposed.

### 3) Text insight is always visible
- The `description` prop is rendered as normal text above the chart.
- This gives immediate context and key takeaway before the visual.
- It helps users with cognitive load and benefits all users, not only screen-reader users.

### 4) Table fallback for data parity
- A button toggles a semantic table (`View data as table` / `Hide data table`).
- The table contains real headers (`Stage`, `Applications`) and full row values.
- This ensures users can access exact values without interpreting bar heights.

### 5) Keyboard support
- The toggle is a native `<button>`, so Enter/Space support is built in.
- No custom key handler is required, reducing accessibility bugs.

### 6) Empty-state handling
- If `data.length === 0`, a clear message is shown: `No pipeline data available yet.`
- In that state, no chart image region and no table toggle are rendered.
- This prevents misleading interactions for missing data.

## Test coverage for accessibility behavior
The test suite in `src/features/charts/tests/AccessiblePipelineChart.test.jsx` verifies:
- heading + description rendering
- labeled chart region (`role="img"` with accessible name)
- table toggle via click
- table toggle via keyboard
- table values match chart input data
- empty-state behavior removes chart/toggle and shows fallback message

## Why this approach is maintainable
- Accessibility behavior is centralized in one component (single responsibility).
- The component is prop-driven (`title`, `description`, `data`) and reusable for other chart datasets.
- Tests focus on user-observable behavior, which makes refactoring safer.
