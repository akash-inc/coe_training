import { Card, Heading, Text, HStack, Icon, Badge } from "@chakra-ui/react";
import { LuLayers } from "react-icons/lu";
import { Button } from "../Button/Button";
import { ProgressBar } from "../ProgressBar/ProgressBar";

/**
 * Summary card for a flashcard deck: title, description, card count,
 * progress, and a study action.
 */
export function DeckCard({ title, description, cardCount, progress = 0, category, onStudy }) {
  return (
    <Card.Root w="full">
      <Card.Body gap={3}>
        <HStack justify="space-between" align="start">
          <Heading size="md">{title}</Heading>
          {category && <Badge colorPalette="purple" variant="subtle">{category}</Badge>}
        </HStack>
        <Text color="fg.muted" fontSize="sm">{description}</Text>
        <HStack color="fg.muted" fontSize="sm" gap={1}>
          <Icon aria-hidden="true"><LuLayers /></Icon>
          <Text>{cardCount} cards</Text>
        </HStack>
        <ProgressBar label="Mastery" value={progress} showValue />
      </Card.Body>
      <Card.Footer>
        <Button colorPalette="blue" w="full" onClick={onStudy}>
          Study deck
        </Button>
      </Card.Footer>
    </Card.Root>
  );
}
