## Accessibility at a Glance

- Proper form labels, headings, and image descriptions are used everywhere (Semantic UI).
- jest-axe checks for common accessibility problems in the code.
- axe-core runs extra tests to catch more accessibility issues.
- Cypress and cypress-axe tools test the experience like a real user for accessibility.
- Pa11y quickly scans the site and gives an easy report about accessibility.
- Scripts in package.json make it simple to run accessibility checks.
- Lighthouse tool automatically checks our accessibility score when we update.
- CI workflow warns us if the accessibility score drops (Lighthouse).
- All tools together help us keep improving accessibility, and we do a manual check too.

### Useful References

- [Cypress accessibility notes](https://github.com/akash-inc/coe_training/blob/main/Day%203/practice-app/src/tests/cypress/CYPRESS_ACCESSIBILITY.md)
- [Pa11y overview](https://github.com/akash-inc/coe_training/blob/main/Day%203/practice-app/public/P11Y/P11Y_OVERVIEW.md)
- [jest-axe README](https://github.com/NickColley/jest-axe#readme)
- [axe-core rules](https://dequeuniversity.com/rules/axe/)


#### Accessibility Testing: Automated vs Manual

`jest-axe` is great for catching many objective accessibility rule violations, but it does not reliably evaluate semantic intent. In `Card.tsx`, if the title is rendered as a generic element instead of a heading (for example, a `div` instead of `h2`), this can still pass automated checks in some cases. Manual testing and semantic review are still required.

#### What jest-axe catches

`jest-axe` runs `axe-core` against rendered markup and reports objective rule violations.

Typical issues it catches:

- Missing form labels or missing accessible names for controls
- Invalid or conflicting ARIA attributes
- Missing `alt` text on images
- Interactive elements without an accessible name
- Duplicate IDs and broken ARIA references
- Landmark or region rule violations (context dependent)

Important limitation in Jest/JSDOM:

- Color-contrast checks are often disabled because they are not reliable in JSDOM environments.

What still needs manual review:

- Semantic intent and document meaning (for example, heading hierarchy)
- Whether label/alt wording is meaningful (not only present)
- Keyboard interaction quality and tab flow in complex widgets
- Screen reader announcements for dynamic updates
- Overall UX clarity and context-specific accessibility expectations

Reference: [jest-axe README](https://github.com/NickColley/jest-axe#readme), [axe-core rules](https://dequeuniversity.com/rules/axe/)

#### Jest-axe and Axe-core

Both `jest-axe` and `axe-core` use the same underlying rules engine (`axe-core`). `jest-axe` is mainly a Jest-friendly wrapper that makes assertions easy in unit/component tests.

