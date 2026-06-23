import { Button } from "./Button";

export default {
  title: "Components/Button",
  component: Button,
  // Note: Chakra v3's "teal" solid button fails WCAG AA contrast (3.74:1) at the
  // default 14px size — the a11y test catches it. "blue" passes, so it's the default.
  args: { children: "Click me", colorPalette: "blue" },
  argTypes: {
    colorPalette: {
      control: "select",
      options: ["blue", "red", "gray", "purple"],
    },
  },
};

export const Primary = {};

export const Disabled = {
  args: { disabled: true, children: "Can't click" },
};

// `loadingText` keeps an accessible name while the spinner shows. Without it,
// Chakra hides the children and the button has no name for screen readers.
export const Loading = {
  args: { loading: true, loadingText: "Saving…", children: "Save" },
};
