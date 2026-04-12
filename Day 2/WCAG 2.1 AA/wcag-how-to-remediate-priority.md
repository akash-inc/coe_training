## WCAG-Approved Prioritization Model (Conformance-First)

Use WCAG conformance level as the official priority model.

### 1) Prioritize by Conformance Level

1. **Level A issues first** (minimum conformance requirement)
2. **Level AA issues next** (common legal and policy target)
3. **Level AAA last** (optional/advanced target)

### 2) Track by Success Criterion (SC)

For each issue, record:

- SC number (for example, `1.1.1`, `4.1.2`)
- SC title
- Level (`A`, `AA`, or `AAA`)
- Affected page/template/component
- Current status (`Open`, `In progress`, `Fixed`, `Verified`)

### 3) Apply Page-Level Conformance

WCAG conformance is evaluated at the page level. A page is conformant for a target level only when all required SCs at that level pass.

### Practical Remediation Order

Use this order for execution:

1. **All Level A blockers on core journeys first** (login, auth, search, checkout, submit, messaging)
2. **Remaining Level A issues across the full scope**
3. **Level AA issues on core journeys**
4. **Remaining Level AA issues**
5. **AAA improvements** (if in scope)

### Tie-Breakers (WCAG-Aligned)

When two issues are at the same level (for example, both are AA), fix in this order:

1. Blocked interaction first (keyboard trap, unlabeled control, broken form input)
2. Core journey first (auth, search, transaction, messaging)
3. High-frequency component first (reused navigation/buttons/cards/forms)
4. Quick broad-impact fix first (small change, many pages/components)

### Quick Examples from This Audit

- Missing button/link/input names (`4.1.2`, A) -> highest priority
- Missing meaningful image `alt` (`1.1.1`, A) -> high priority
- Nested interactive controls (`4.1.2`, A) -> high priority
- Contrast issue on secondary label text (`1.4.3`, AA) -> after A issues
- Viewport zoom restriction (`1.4.4`, AA) -> after A issues, high on mobile flows

