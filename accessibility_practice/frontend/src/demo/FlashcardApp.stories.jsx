import { FlashcardApp } from "./FlashcardApp";

export default {
  title: "Demo/FlashcardApp",
  component: FlashcardApp,
  parameters: { layout: "fullscreen" },
};

// Full composed page — every library component working together. Also runs
// through the a11y gate, so the whole page is accessibility-checked.
export const Page = {};
