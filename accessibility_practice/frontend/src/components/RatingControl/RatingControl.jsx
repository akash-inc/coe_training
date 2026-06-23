import { ButtonGroup, Text, Stack } from "@chakra-ui/react";
import { Button } from "../Button/Button";

// Spaced-repetition recall ratings (Anki-style).
const RATINGS = [
  { value: "again", label: "Again", colorPalette: "red" },
  { value: "hard", label: "Hard", colorPalette: "orange" },
  { value: "good", label: "Good", colorPalette: "blue" },
  { value: "easy", label: "Easy", colorPalette: "green" },
];

/**
 * Recall-quality rating bar shown after revealing an answer. Each rating is a
 * labeled button; the group is labelled for screen readers.
 */
export function RatingControl({ onRate }) {
  return (
    <Stack gap={2}>
      <Text fontSize="sm" color="fg.muted" id="rating-help">
        How well did you recall this?
      </Text>
      <ButtonGroup size="sm" aria-labelledby="rating-help">
        {RATINGS.map((r) => (
          <Button
            key={r.value}
            colorPalette={r.colorPalette}
            variant="subtle"
            onClick={() => onRate?.(r.value)}
          >
            {r.label}
          </Button>
        ))}
      </ButtonGroup>
    </Stack>
  );
}
