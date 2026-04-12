# Accessibility Details

- We use semantic table tags: `table`, `thead`, `tbody`, `th`, and `td`.
- We added a table `caption` so screen readers know what this table is about.
- Every header cell uses `scope="col"` for clear column mapping.
- Sortable headers use real `button` elements (keyboard friendly).
- We set `aria-sort` on sortable columns (`ascending`, `descending`, `none`).
- We added a screen-reader-only status message (`aria-live="polite"`) to announce count and sort updates.
- We keep `aria-live` off the whole table to avoid noisy or disorienting announcements.
- Filter controls use native `select` fields for built-in accessibility.
- Each filter is wrapped in a `label` so inputs have proper names.
- Filters are grouped inside a `section` with `aria-label="Movie filters"`.
- Keyboard focus is clearly visible with `:focus-visible` styles.
- Links are standard `a` tags, so they are naturally keyboard and screen-reader friendly.
- On smaller screens, table can scroll horizontally to keep content readable.
