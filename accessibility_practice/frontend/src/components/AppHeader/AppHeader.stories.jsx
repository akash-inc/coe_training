import { AppHeader } from "./AppHeader";

export default {
  title: "Flashcards/AppHeader",
  component: AppHeader,
  parameters: { layout: "fullscreen" },
  args: { appName: "FlashLearn", streak: 12, userName: "Jane Learner" },
};

export const Default = {};
