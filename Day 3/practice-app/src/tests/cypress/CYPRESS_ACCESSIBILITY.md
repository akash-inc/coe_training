# Cypress Accessibility — notes

## What it does (summary)

Cypress Accessibility adds automated accessibility checks using **axe-core**, powered by **Cypress Cloud** and the same kind of capture used for **Test Replay**.

- **Checks run in the cloud** while your run is processed, so your E2E and component tests keep their usual speed; accessibility is not meant to slow or fail tests locally in the same way as in-test assertions.
- It analyzes **every page and component state** that appears during **recorded** runs—not only the first paint—so you get signal from real journeys and variations.
- You get **consolidated reports**: by view (page/component) and by rule (axe rule), so you can see clusters and patterns.
- **Triage support**: DOM snapshots at violation time, links to Test Replay, Deque University explanations, and shareable deep links.
- **Change tracking**: results tie to specific runs (branch, build, test set); Branch Review can highlight new, resolved, and changed failures.

**Caveat:** this path is **Cypress Cloud–centric**. You need runs **recorded to Cypress Cloud** for this layer. It is different from adding something like `cypress-axe` locally to fail the build unless you set that up separately.

---

## Do I write accessibility tests, or does it happen on its own?

| Layer | Who writes it? | Automatic? |
|--------|----------------|------------|
| Cypress Accessibility (Cloud) | Whoever writes your Cypress tests (often dev, sometimes QA) | **Scanning/reporting** is automatic in cloud once runs are recorded; you do not author separate “a11y-only” cases for that product |
| Explicit a11y assertions (e.g. jest-axe, cypress-axe) | Developer and/or tester, by team convention | **No** — you write and maintain those tests |