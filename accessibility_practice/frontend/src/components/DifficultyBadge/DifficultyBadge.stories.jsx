import { HStack } from "@chakra-ui/react";
import { DifficultyBadge } from "./DifficultyBadge";

export default {
  title: "Flashcards/DifficultyBadge",
  component: DifficultyBadge,
  args: { level: "medium" },
};

export const Easy = { args: { level: "easy" } };
export const Medium = { args: { level: "medium" } };
export const Hard = { args: { level: "hard" } };

export const AllLevels = {
  render: () => (
    <HStack gap={3}>
      <DifficultyBadge level="easy" />
      <DifficultyBadge level="medium" />
      <DifficultyBadge level="hard" />
    </HStack>
  ),
};
