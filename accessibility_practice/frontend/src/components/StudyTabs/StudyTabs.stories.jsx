import { Text } from "@chakra-ui/react";
import { StudyTabs } from "./StudyTabs";

export default {
  title: "Flashcards/StudyTabs",
  component: StudyTabs,
  args: {
    tabs: [
      { value: "due", label: "Due (24)", content: <Text>24 cards are due for review.</Text> },
      { value: "new", label: "New (10)", content: <Text>10 new cards to learn.</Text> },
      { value: "learned", label: "Learned", content: <Text>312 cards mastered.</Text> },
    ],
  },
};

export const Default = {};
