# Day 2 practice: what matches each accessibility topic

Short map between the learning list and this project. If something is not listed under a topic, we have not really exercised it here yet.

---

### Screen reader announcement strategies (aria-live regions)

**Done here**

- The movie table uses a **visually hidden** line (`sr-only`) with **`aria-live="polite"`** and **`aria-atomic="true"`** so when you sort or filter, assistive tech hears an update like how many rows are shown and how they are sorted—without putting live regions on the whole table (which would be noisy).
- The add-movie form shows submit errors in a block that only exists when there is a message, with **`role="alert"`** and **`aria-atomic="true"`** so errors are announced when they appear.

---

### Exercise: accessible data table with sorting and filtering

**Done here**

- Semantic **`<table>`** with **caption**, **`<thead>` / `<tbody>`**, **`scope="col"`** on headers.
- **Sortable** columns use real **`<button>`** controls, with **`aria-sort`** (`ascending` / `descending` / `none`).
- **Filters** (genre, Netflix original, bookmarkable) use **`<select>`** with **`<label>`** and sit in a **`<section aria-label="Movie filters">`**.
- Extra columns (cast, trailer, bookmarkable) moved into a **details dialog** opened from the **title** (button with dialog labelling), while duration stays in the table.

---

### Practice: accessible form validation with error announcements

**Done here**

- Validation runs on submit; the first problem sets a **single clear error message**.
- That message is tied to the failing field with **`aria-invalid`** and **`aria-describedby`** pointing at the error paragraph **`id`**.
- The error paragraph uses **`role="alert"`** (only when there is text) so screen readers announce it.
- After a bad submit, **focus moves to the first invalid field** (`useLayoutEffect` + refs) so keyboard users land where they need to fix.
- Changing a field clears the submit error so old messages do not stick around.

---

### Learn: focus management in single-page applications

**Done here**

- **Focus the field in error** after a failed submit on the add-movie form.
- **Open a modal dialog** with **`showModal()`**, **move focus into the dialog**, and **return focus** to the control that opened it when the dialog closes (see focus trap hook below).

---

### Exercise: focus trap for modal dialogs

**Done here**

- **`useModalFocusTrap`** (`src/hooks/useModalFocusTrap.ts`) keeps **Tab / Shift+Tab** cycling inside the dialog while it is open, focuses the **first focusable** control when it opens, and **restores focus** to the previously focused element when the trap turns off—if focus was still inside the dialog.
- The movie detail **`MovieDetailModal`** uses a **`<dialog>`** with **`tabIndex={-1}`** as a fallback if nothing else can take focus, plus **`aria-labelledby`** on the title.

---

## Quick checklist

| Topic | In this repo? |
| ----- | ------------- |
| aria-live / polite table status | Yes |
| role="alert" for form errors | Yes |
| Accessible table + sort + filter | Yes |
| Form errors + field link + focus to error | Yes |
| Modal focus trap + restore | Yes |
