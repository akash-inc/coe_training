# Accessibility Audit Diagnosis Report

Source: `Audit.md` (axe DevTools scan for `https://peerlist.io/scroll`)  
Standard target: **WCAG 2.1 AA**  
Total issues: **41** (Automatic: 41, Guided: 0, Manual: 0)

## Executive Snapshot

- **Critical:** 20
- **Serious:** 20
- **Moderate:** 1
- **Minor:** 0

The issues are clustered into 8 violation types. Most failures are around accessible names, labels, text alternatives, and invalid interactive structure.

## Violations Mapped to Rules


| #   | Axe Rule / Check                                                   | Occurrences | Impact   | What is violating                                                                           | WCAG / Standards from report                                  |
| --- | ------------------------------------------------------------------ | ----------- | -------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 1   | Ensure every ARIA button, link and menuitem has an accessible name | 4           | Serious  | `div[role="button"]` has no readable name (`aria-label` / `aria-labelledby` / text missing) | WCAG **4.1.2** (`wcag412`), WCAG 2A                           |
| 2   | Ensure buttons have discernible text                               | 16          | Critical | Button like `#radix-:r1h:` has no accessible text/name                                      | WCAG **4.1.2** (`wcag412`), WCAG 2A, Section 508              |
| 3   | Ensure foreground/background contrast meets minimum                | 6           | Serious  | `.text-green-300` (“Newest”) contrast is **3.07:1** vs required **4.5:1**                   | WCAG **1.4.3** (`wcag143`), WCAG 2AA                          |
| 4   | Ensure `<img>` has alt text or presentation role                   | 3           | Critical | Image `/emojis/rocket.svg` missing `alt` (or equivalent accessible name)                    | WCAG **1.1.1** (`wcag111`), WCAG 2A, Section 508              |
| 5   | Ensure every form element has a label                              | 1           | Critical | Search input `#react-select-peerlist-search-input` has no programmatic label                | WCAG **4.1.2** (`wcag412`), WCAG 2A, Section 508              |
| 6   | Ensure links have discernible text                                 | 3           | Serious  | Link `a[href$="notifications"]` is focusable but has no accessible text                     | WCAG **2.4.4** (`wcag244`) and **4.1.2** (`wcag412`), WCAG 2A |
| 7   | Ensure viewport meta does not disable zoom                         | 1           | Moderate | `<meta name="viewport" ... maximum-scale=1.0>` blocks zoom scaling                          | WCAG **1.4.4** (`wcag144`), WCAG 2AA                          |
| 8   | Ensure interactive controls are not nested                         | 7           | Serious  | `div[role="button"]` contains focusable descendant `<button>`                               | WCAG **4.1.2** (`wcag412`), WCAG 2A                           |


## Issue Distribution Validation

Counts add up to total:

`4 + 16 + 6 + 3 + 1 + 3 + 1 + 7 = 41`

## What Violates What (Plain-Language Mapping)

### 1) Name/Role/Value failures (WCAG 4.1.2)

- Missing accessible name on ARIA widgets (`role="button"` etc.)
- Buttons without discernible text
- Links without discernible text
- Form control without label
- Nested interactive controls causing invalid announced role/focus behavior

### 2) Perceivable text failures

- **WCAG 1.4.3:** Insufficient color contrast (`text-green-300` on white)
- **WCAG 1.4.4:** Disabled zoom due to `maximum-scale=1.0` in viewport

### 3) Text alternatives failures

- **WCAG 1.1.1:** Informative images missing `alt` text

### 4) Link purpose failures

- **WCAG 2.4.4:** Link purpose not clear because link has no text label

## Recommended Fix Priority

1. **Critical first:** button text, image alt text, form label (20 issues)
2. **Then serious:** ARIA names, link text, nested interactive controls, contrast (20 issues)
3. **Then moderate:** viewport zoom restriction (1 issue)

## Developer-Facing Remediation Checklist

- Add accessible names (`aria-label` or visible text) to all icon-only buttons/ARIA widgets.
- Ensure each interactive link/button exposes a readable name to screen readers.
- Add meaningful `alt` text for non-decorative images; use `alt=""` only for decorative images.
- Attach labels to all inputs (explicit `<label for>` preferred).
- Remove nested interactive elements (do not place `<button>` inside clickable `div/button/link`).
- Increase text contrast to at least **4.5:1** for normal text.
- Update viewport meta to allow zoom (remove `maximum-scale=1.0`).

