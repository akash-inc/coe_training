import { DeckPagination } from "./DeckPagination";

export default {
  title: "Flashcards/DeckPagination",
  component: DeckPagination,
  args: { count: 120, pageSize: 12, defaultPage: 1 },
};

export const Default = {};
export const MiddlePage = { args: { defaultPage: 5 } };
