## Accessibility Testing: Automated vs Manual

**jest-axe** is great for catching many objective accessibility rule violations, but it does not reliably evaluate semantic intent. In [`Card.tsx`], the title is rendered as a `<div>`, and this can still pass `jest-axe` even when a heading element (for example, `<h2>`) would be a better semantic choice. Manual testing and semantic review are still required.

**What jest-axe will catch:**

`jest-axe` runs `axe-core` against rendered markup and reports objective rule violations. In this card, it should flag the text input because it has no associated `<label>` (or equivalent accessible name), but it may still allow the title `<div>` because that is a semantic-quality decision rather than a guaranteed rule failure.

Typical issues it catches include:

- Missing form labels / missing accessible names for controls
- Invalid or conflicting ARIA attributes
- Missing `alt` text on images
- Interactive elements without an accessible name
- Duplicate IDs and broken `aria-`* references
- Landmark / region rule violations (context dependent in component tests)

**Important limitation in Jest/JSDOM:**

- Color-contrast checks are disabled in `jest-axe` because they do not work reliably in JSDOM.

**What jest-axe does not cover well (manual review still needed):**

- Semantic intent and document meaning, such as whether a visual title should be a heading (`<h2>`) instead of a generic `<div>`
- Whether label/alt text wording is meaningful (not just present)
- Keyboard interaction quality and tab flow in complex widgets
- Screen reader announcement quality for dynamic updates
- Overall UX clarity and context-specific accessibility expectations

*Read more: [jest-axe README](https://github.com/NickColley/jest-axe#readme) and [axe-core rules overview*](https://dequeuniversity.com/rules/axe/)

## Jest-axe and Axe-core

Both `jest-axe` and `axe-core` use the same underlying accessibility rules engine: `axe-core`. The main difference is that `jest-axe` integrates these rules into a Jest testing workflow for React apps, making it easier to write automated accessibility assertions in your tests. Under the hood, `jest-axe` simply wraps the `axe-core` engine, so the actual violations detected are essentially the same in both. The choice largely comes down to testing environment and convenience.

## [Cypress](https://github.com/akash-inc/coe_training/blob/main/Day%203/practice-app/src/tests/cypress/CYPRESS_ACCESSIBILITY.md)

## [P11Y](https://github.com/akash-inc/coe_training/blob/main/Day%203/practice-app/public/P11Y/P11Y_OVERVIEW.md)

