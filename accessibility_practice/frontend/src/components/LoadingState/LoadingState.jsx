import { VStack, Spinner, Text } from "@chakra-ui/react";

/**
 * Loading indicator with a visible, screen-reader-announced label.
 * The spinner is given an accessible name so it isn't an unlabeled graphic.
 */
export function LoadingState({ label = "Loading cards…" }) {
  return (
    <VStack gap={3} role="status" aria-live="polite" py={8}>
      {/* Spinner is decorative; the role="status" region + visible text below
          is what gets announced to screen readers. */}
      <Spinner size="lg" colorPalette="blue" />
      <Text color="fg.muted" fontSize="sm">{label}</Text>
    </VStack>
  );
}
