import { HStack } from "@chakra-ui/react";
import { CategoryTag } from "./CategoryTag";

export default {
  title: "Flashcards/CategoryTag",
  component: CategoryTag,
  args: { children: "Biology" },
};

export const Default = {};

export const Closable = {
  args: { children: "History", colorPalette: "blue", onClose: () => {} },
};

export const Group = {
  render: () => (
    <HStack gap={2}>
      <CategoryTag colorPalette="purple">Math</CategoryTag>
      <CategoryTag colorPalette="green">Science</CategoryTag>
      <CategoryTag colorPalette="blue">History</CategoryTag>
    </HStack>
  ),
};
