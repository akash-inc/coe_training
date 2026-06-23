# Storybook + Chakra UI — Building an Accessible Component Library

A practical guide to wiring Storybook into a Chakra UI project so you can
develop, document, and **audit components for accessibility** in isolation.

> Companion to [`chakra-ui-guide.md`](./chakra-ui-guide.md). That covers Chakra
> itself; this covers building a documented, a11y-tested component library
> around it.

---

## 1. Why Storybook for an Accessible Library

Chakra already gives you accessible primitives. Storybook adds the workflow that
turns primitives into a *trustworthy library*:

- **Isolation** — build and view each component on its own, in every state
  (loading, error, disabled, dark mode) without running the whole app.
- **Living docs** — auto-generated prop tables and usage examples your team can
  browse.
- **Automated a11y audits** — the `@storybook/addon-a11y` runs axe-core against
  every story and flags violations as you work.
- **Interaction + a11y tests in CI** — catch keyboard/focus/ARIA regressions
  before they ship.

The combination: Chakra provides accessible defaults, Storybook proves and
keeps them accessible.

---

## 2. Installation

From the root of your Chakra project:

```bash
# Scaffolds Storybook and detects your framework (Vite/Next/etc.)
npx storybook@latest init
```

Then add the accessibility addon (and testing helpers):

```bash
npm i -D @storybook/addon-a11y @storybook/test
```

This creates a `.storybook/` folder with `main.js` and `preview.jsx`.

---

## 3. Register the a11y Addon

```js
// .storybook/main.js
export default {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-a11y", // ← accessibility panel + checks
  ],
  framework: { name: "@storybook/react-vite", options: {} },
};
```

---

## 4. Wrap Every Story in ChakraProvider (Decorator)

Stories render outside your app, so they don't get the provider automatically.
A **global decorator** injects Chakra's theme + color mode into every story —
this is the single most important integration step.

```jsx
// .storybook/preview.jsx
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";

export const decorators = [
  (Story) => (
    <ChakraProvider value={defaultSystem}>
      <Story />
    </ChakraProvider>
  ),
];

export const parameters = {
  // Make the a11y addon report violations loudly
  a11y: {
    config: {},
    options: { runOnly: ["wcag2a", "wcag2aa"] }, // axe rule sets
  },
};
```

> If you use a custom theme (`createSystem`), import and pass *that* system here
> so stories match production exactly.

### Bonus: a color-mode toolbar toggle

Add a global toolbar control so you can flip light/dark and verify contrast in
both modes:

```jsx
// .storybook/preview.jsx
export const globalTypes = {
  colorMode: {
    description: "Chakra color mode",
    defaultValue: "light",
    toolbar: {
      icon: "circlehollow",
      items: ["light", "dark"],
    },
  },
};
```

---

## 5. Writing a Story for a Component

Use Component Story Format (CSF). Each named export is one story (one state).

```jsx
// src/components/Button/Button.stories.jsx
import { Button } from "@chakra-ui/react";

export default {
  title: "Components/Button",
  component: Button,
  // controls auto-generated from args
  args: { children: "Click me", colorPalette: "teal" },
  argTypes: {
    colorPalette: {
      control: "select",
      options: ["teal", "blue", "red", "gray"],
    },
  },
};

export const Primary = {};

export const Disabled = {
  args: { disabled: true, children: "Can't click" },
};

export const Loading = {
  args: { loading: true, children: "Saving…" },
};
```

Stories double as your test fixtures and your documentation — write one per
meaningful state.

---

## 6. The Accessibility Panel

Once running (`npm run storybook`), open any story and check the **Accessibility
tab** in the addon panel. It shows three groups from axe-core:

- **Violations** — must fix (e.g. insufficient color contrast, missing
  `aria-label`, button with no accessible name).
- **Passes** — rules that succeeded.
- **Incomplete** — needs a human to verify (axe couldn't decide).

This runs live as you tweak args, so you get instant feedback on whether a
variant is accessible.

### Common violations you'll catch

| Violation | Typical Chakra fix |
|-----------|--------------------|
| Icon button has no accessible name | add `aria-label="Close"` |
| Low contrast text | use a darker token (`gray.700` not `gray.400`) |
| Form input has no label | pair with `<Field.Label>` / `htmlFor` |
| Non-semantic clickable | use `<Button>`, not a styled `<Box onClick>` |

---

## 7. Per-Story a11y Configuration

You can tune or disable specific axe rules per story when you have a justified
reason (document why — disabling a rule is a decision, not a default).

```jsx
export const DecorativeIcon = {
  parameters: {
    a11y: {
      config: {
        // We mark this icon decorative via aria-hidden, so skip the name rule
        rules: [{ id: "image-alt", enabled: false }],
      },
    },
  },
};
```

---

## 8. Automating a11y Checks in CI

The panel is interactive; for a real library you want failures to **block the
build**. Use the test-runner with the a11y preset.

```bash
npm i -D @storybook/test-runner axe-playwright
```

```js
// .storybook/test-runner.js
import { injectAxe, checkA11y } from "axe-playwright";

export default {
  async preVisit(page) {
    await injectAxe(page);
  },
  async postVisit(page) {
    await checkA11y(page, "#storybook-root", {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  },
};
```

Run it against a running (or built) Storybook:

```bash
# locally
npm run storybook &        # serve on :6006
npx test-storybook

# CI: build then test the static output
npm run build-storybook
npx concurrently -k -s first \
  "npx http-server storybook-static -p 6006 --silent" \
  "npx wait-on tcp:6006 && npx test-storybook"
```

Now any story that introduces an accessibility violation fails CI.

---

## 9. Testing Interaction & Keyboard Behavior

Accessibility isn't just static rules — it's keyboard and focus behavior. Add a
`play` function to simulate real user interaction and assert focus/ARIA state.

```jsx
import { within, userEvent, expect } from "@storybook/test";

export const KeyboardAccessible = {
  args: { children: "Submit" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: /submit/i });

    // Reachable by keyboard
    await userEvent.tab();
    await expect(button).toHaveFocus();

    // Activatable by keyboard
    await userEvent.keyboard("{Enter}");
  },
};
```

The test-runner executes these `play` functions too, so keyboard regressions
fail CI alongside axe violations.

---

## 10. Documenting Accessibility (MDX Docs)

Use MDX docs pages to record the a11y contract of each component — what roles it
uses, keyboard shortcuts, and required props.

```mdx
{/* Button.mdx */}
import { Meta, Canvas } from "@storybook/blocks";
import * as ButtonStories from "./Button.stories";

<Meta of={ButtonStories} />

# Button

### Accessibility
- Renders a native `<button>` (role `button`, keyboard-activatable).
- Icon-only usage **requires** `aria-label`.
- Focus ring is visible via `_focusVisible` — do not remove it.

<Canvas of={ButtonStories.Primary} />
```

---

## 11. Recommended Project Workflow

A repeatable loop for adding a component to the library:

1. **Build** the component using Chakra style props (semantic elements first).
2. **Write stories** for every meaningful state (default, disabled, loading,
   error, dark mode).
3. **Open the a11y panel** — fix all violations, review incompletes by hand.
4. **Add a `play` test** for keyboard/focus behavior.
5. **Write an MDX doc** capturing the accessibility contract.
6. **Run `test-storybook`** locally, then let CI enforce it on every PR.

---

## 12. Quick Reference

```text
npx storybook@latest init        # scaffold
@storybook/addon-a11y            # live axe-core panel
.storybook/preview.jsx           # ChakraProvider decorator (REQUIRED)
*.stories.jsx                    # one export per component state
play: async (...)                # keyboard/interaction tests
@storybook/test-runner           # run a11y + interaction checks in CI
*.mdx                            # document the accessibility contract
```

---

### Further Reading
- Storybook a11y addon: https://storybook.js.org/addons/@storybook/addon-a11y
- Test runner: https://storybook.js.org/docs/writing-tests/test-runner
- axe-core rules: https://github.com/dequelabs/axe-core
- Chakra accessibility notes: https://chakra-ui.com/docs/components (per-component "Accessibility" sections)
