import { SearchBar } from "./SearchBar";

export default {
  title: "Flashcards/SearchBar",
  component: SearchBar,
  args: { label: "Search decks" },
};

export const Default = {};
export const Prefilled = { args: { value: "Spanish" } };
