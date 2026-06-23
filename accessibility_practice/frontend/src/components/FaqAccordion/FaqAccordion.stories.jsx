import { FaqAccordion } from "./FaqAccordion";

export default {
  title: "Flashcards/FaqAccordion",
  component: FaqAccordion,
  args: {
    items: [
      { value: "srs", question: "What is spaced repetition?", answer: "A technique that schedules reviews at increasing intervals to improve long-term retention." },
      { value: "reset", question: "Can I reset a deck's progress?", answer: "Yes — open the deck settings and choose Reset progress." },
      { value: "share", question: "How do I share a deck?", answer: "Use the Share button on any deck to generate a public link." },
    ],
  },
};

export const Default = {};
export const FirstOpen = { args: { defaultValue: ["srs"] } };
