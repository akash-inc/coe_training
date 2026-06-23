import { ProgressBar } from "./ProgressBar";

export default {
  title: "Flashcards/ProgressBar",
  component: ProgressBar,
  args: { label: "Deck progress", value: 64 },
};

export const Default = {};
export const Empty = { args: { value: 0 } };
export const Complete = { args: { value: 100, colorPalette: "green" } };
