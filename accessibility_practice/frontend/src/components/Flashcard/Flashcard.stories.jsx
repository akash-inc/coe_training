import { Flashcard } from "./Flashcard";

export default {
  title: "Flashcards/Flashcard",
  component: Flashcard,
  args: {
    front: "What is the capital of France?",
    back: "Paris",
    category: "Geography",
  },
};

export const Question = {};

export const NoCategory = {
  args: { category: undefined },
};

export const LongContent = {
  args: {
    front: "Explain the difference between TCP and UDP.",
    back: "TCP is connection-oriented and reliable; UDP is connectionless and faster but lossy.",
    category: "Networking",
  },
};
