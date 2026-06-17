# Day 15: Accessibility Audit

**Date:** 2026-06-17  
**Standard:** WCAG 2.1 Level AA (target)  
**Scope:** React frontend (`Day 15/frontend/`)

---

## Executive Summary

Day 15 has a solid foundation (`lang="en"`, labeled login form, some ARIA on comments). It does not yet meet WCAG 2.1 AA for a "fully accessible" claim: task forms lack labels, dynamic content is not announced, keyboard focus is not managed when panels open, and there is no automated a11y test suite. Document gaps below; fix after explicit approval per capstone scope.

---

## What Works Today

| Criterion | Implementation | File |
|-----------|----------------|------|
| Page language | `lang="en"` on `<html>` | `index.html` |
| Login labels | `<label>` wrapping email/password inputs | `LoginForm.jsx` |
| Autocomplete | `autoComplete="email"` and `current-password` | `LoginForm.jsx` |
| Decorative icons | `aria-hidden="true"` on brand icon, avatar, spinner | `App.jsx`, `UserProfile.jsx` |
| Comments region | `aria-label="Task comments"` on section | `TaskComments.jsx` |
| Comment input label | `htmlFor` + `id` pairing | `TaskComments.jsx` |
| Expand state | `aria-expanded` on task card button | `TaskList.jsx` |
| Semantic headings | `h1`, `h2`, `h3` hierarchy in login and tasks | `LoginForm.jsx`, `TaskList.jsx` |
| Focus styles | `:focus` styles on inputs | `LoginForm.css`, `TaskComments.css` |

---

## Gaps by WCAG Principle

### Perceivable (1.x)

| ID | Criterion | Issue | Evidence | Severity | Fix |
|----|-----------|-------|----------|----------|-----|
| P1 | 1.3.1 Info and Relationships | Task create/edit inputs have no labels | `TaskList.jsx` 143-161, 175-193 | High | Add `<label>` or `aria-label` |
| P2 | 1.4.3 Contrast (Minimum) | Not verified in CI | CSS uses muted grays | Medium | Run Lighthouse or axe contrast check |
| P3 | 1.4.11 Non-text Contrast | Status badges (Open/Done) not verified | `TaskList.css` | Low | Manual contrast audit |

### Operable (2.x)

| ID | Criterion | Issue | Evidence | Severity | Fix |
|----|-----------|-------|----------|----------|-----|
| O1 | 2.1.1 Keyboard | Duplicate tab stops for comments toggle | `TaskList.jsx` 208-231 | Medium | Consolidate controls |
| O2 | 2.4.1 Bypass Blocks | No skip link | `App.jsx` | Medium | Add "Skip to main content" link |
| O3 | 2.4.3 Focus Order | Focus not moved into comments panel on expand | `TaskList.jsx` | Medium | `useRef` + `focus()` on open |
| O4 | 2.4.7 Focus Visible | Present on inputs; verify on all buttons | CSS | Low | Spot check action buttons |

### Understandable (3.x)

| ID | Criterion | Issue | Evidence | Severity | Fix |
|----|-----------|-------|----------|----------|-----|
| U1 | 3.3.1 Error Identification | Login error not announced | `LoginForm.jsx` 45 | Medium | `role="alert"` |
| U2 | 3.3.1 Error Identification | Task/comment errors plain text | `TaskList.jsx`, `TaskComments.jsx` | Medium | `aria-live="polite"` on error containers |
| U3 | 3.3.2 Labels or Instructions | Placeholder used as only label for tasks | `TaskList.jsx` | High | Visible labels |

### Robust (4.x)

| ID | Criterion | Issue | Evidence | Severity | Fix |
|----|-----------|-------|----------|----------|-----|
| R1 | 4.1.2 Name, Role, Value | `aria-expanded` without `aria-controls` | `TaskList.jsx` 212 | Medium | Link button to panel `id` |
| R2 | 4.1.3 Status Messages | Loading text not a live region | `App.jsx` 75-79 | Medium | `role="status"` + `aria-live="polite"` |
| R3 | 4.1.3 Status Messages | WebSocket status ("Live"/"Offline") not announced | `TaskComments.jsx` 203-205 | Low | `aria-live="polite"` on status span |

---

## Component-Level Notes

### LoginForm

- Strengths: proper labels, required fields, autocomplete.
- Gaps: error message needs `role="alert"`; hint text with demo credentials is fine for learning.

### TaskList

- Strengths: list semantics (`ul`/`li`), heading structure, `aria-expanded`.
- Gaps: unlabeled create/edit fields; redundant comment buttons; no `aria-controls`; delete has no confirmation (acceptable for demo but consider `aria-describedby` warning).

### TaskComments

- Strengths: labeled textarea, section `aria-label`, optimistic state shows "Sending…".
- Gaps: connection status is visual only; edit textarea lacks label; close button is fine.

### App shell

- Gaps: no landmark `role="main"` explicit (uses `<main>` which is good); no skip link; loading state not announced.

---

## Automated Testing Gap

| Tool | Status in Day 15 |
|------|------------------|
| jest-axe | Not configured |
| Cypress-axe | Not configured |
| Lighthouse CI | Not configured |
| Pa11y | Not configured |

**Recommendation:** Add `vitest` + `jest-axe` for `LoginForm` and `TaskList` render tests; optional Lighthouse CI job on the frontend build artifact.

---

## Manual Verification Checklist

Run before demo if claiming accessibility:

### Keyboard only

- [ ] Tab from page load reaches login fields in logical order
- [ ] Submit login with Enter
- [ ] Tab through task list: create form, task actions, comments panel
- [ ] Expand comments with Enter/Space on expand control
- [ ] Post comment with keyboard only
- [ ] Edit and delete own comment via keyboard
- [ ] Logout reachable without mouse

### Screen reader (VoiceOver on macOS or NVDA on Windows)

- [ ] Page title and main heading announced
- [ ] Login labels read correctly
- [ ] Login error announced on failed attempt (after fix)
- [ ] Task count and list items announced
- [ ] Comments panel expansion state announced
- [ ] New comment appears after post (may need live region after fix)

### Lighthouse (Chrome DevTools)

- [ ] Run Accessibility audit on logged-in dashboard
- [ ] Target score: 90+ (document actual score below)

```
Lighthouse a11y score (fill in): ___ / 100
Date tested: ___________
Tester: ___________
```

### Color and zoom

- [ ] UI usable at 200% browser zoom
- [ ] No horizontal scroll at 320px viewport width

---

## Demo Talking Points

**What to say honestly in demo:**

- Login form follows label and autocomplete best practices.
- Comments section uses ARIA landmarks and labeled input.
- Real-time sync is visual; status indicators need live region polish.
- Full WCAG AA is on the backlog (see `NEXT_STEPS.md` quick wins).

---

## Related Documents

- [CODE_REVIEW.md](./CODE_REVIEW.md) (M1-M3, L3-L4)
- [DEMO_SCRIPT.md](./DEMO_SCRIPT.md)
- [NEXT_STEPS.md](./NEXT_STEPS.md)
