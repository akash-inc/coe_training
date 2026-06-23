import { useState } from "react";
import { Card, Text, Badge, HStack, Box } from "@chakra-ui/react";

/**
 * A study flashcard that flips between question and answer.
 *
 * Accessibility:
 * - The whole card is a real <button> so it's keyboard-focusable and
 *   activatable with Enter/Space.
 * - `aria-pressed` exposes the flipped state to screen readers, and an
 *   aria-label announces which side is showing.
 */
export function Flashcard({ front, back, category }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <Card.Root
      as="button"
      type="button"
      onClick={() => setFlipped((f) => !f)}
      aria-pressed={flipped}
      aria-label={flipped ? "Answer shown. Activate to see question." : "Question shown. Activate to reveal answer."}
      w="sm"
      minH="14rem"
      textAlign="left"
      cursor="pointer"
      transition="box-shadow 0.2s, transform 0.2s"
      _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
      _focusVisible={{ outline: "2px solid", outlineColor: "blue.600", outlineOffset: "2px" }}
    >
      <Card.Body display="flex" flexDirection="column" justifyContent="center" gap={4}>
        <HStack justify="space-between">
          {category ? <Badge colorPalette="purple" variant="subtle">{category}</Badge> : <Box />}
          <Text fontSize="xs" color="fg.muted" textTransform="uppercase" letterSpacing="wide">
            {flipped ? "Answer" : "Question"}
          </Text>
        </HStack>
        <Text fontSize="xl" fontWeight="medium">
          {flipped ? back : front}
        </Text>
        <Text fontSize="sm" color="fg.muted">
          {flipped ? "Tap to flip back" : "Tap to reveal answer"}
        </Text>
      </Card.Body>
    </Card.Root>
  );
}
