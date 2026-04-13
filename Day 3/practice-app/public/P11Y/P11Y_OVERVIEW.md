# Pa11y (P11Y) Quick Notes

- **What it is:** Pa11y is a CLI tool that runs automated accessibility checks on web pages using headless browser automation.
- **What it checks:** Common issues like missing labels, contrast problems, ARIA misuse, heading/order problems, and keyboard-related barriers.
- **How it is used:** You run it against a URL (local app, staging, or production preview) and it returns a list of issues.
- **Typical command:** `npx pa11y http://localhost:5173`
- **Output formats:** Can be exported as text, JSON, CSV, or HTML/Markdown-style reports for sharing and tracking.
- **When to run it:** During development, in CI pipelines, and before releases as a fast accessibility smoke check.
- **What it is not:** It does not replace manual testing (screen reader, keyboard-only navigation, UX checks).
- **Best practice:** Use Pa11y + component/unit a11y tests (axe/jest-axe) + E2E flows (Cypress) + manual audits.
- **In this repo context:** Use it to quickly validate pages after UI changes, then follow up with Cypress/Jest accessibility tests for deeper coverage.
