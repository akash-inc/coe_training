import { Badge } from "@chakra-ui/react";

const LEVELS = {
  easy: { label: "Easy", colorPalette: "green" },
  medium: { label: "Medium", colorPalette: "orange" },
  hard: { label: "Hard", colorPalette: "red" },
};

/**
 * Difficulty indicator for a card or deck. Uses the `subtle` variant
 * (light background + dark text) which keeps text contrast above AA.
 */
export function DifficultyBadge({ level = "medium" }) {
  const { label, colorPalette } = LEVELS[level] ?? LEVELS.medium;
  return (
    <Badge colorPalette={colorPalette} variant="subtle">
      {label}
    </Badge>
  );
}
