import { DeckCard } from "./DeckCard";

export default {
  title: "Flashcards/DeckCard",
  component: DeckCard,
  args: {
    title: "Spanish Vocabulary",
    description: "Common words and phrases for everyday conversation.",
    cardCount: 120,
    progress: 45,
    category: "Language",
  },
};

export const Default = {};
export const NotStarted = { args: { progress: 0 } };
export const Mastered = { args: { progress: 100 } };
