import { EmptyState, VStack, Icon } from "@chakra-ui/react";
import { LuInbox } from "react-icons/lu";
import { Button } from "../Button/Button";

/**
 * Empty state shown when a learner has no decks yet, with a call to action.
 */
export function EmptyDecks({ onCreate }) {
  return (
    <EmptyState.Root>
      <EmptyState.Content>
        <EmptyState.Indicator>
          <Icon aria-hidden="true"><LuInbox /></Icon>
        </EmptyState.Indicator>
        <VStack textAlign="center" gap={1}>
          <EmptyState.Title>No decks yet</EmptyState.Title>
          <EmptyState.Description>
            Create your first deck to start learning.
          </EmptyState.Description>
        </VStack>
        <Button colorPalette="blue" onClick={onCreate}>Create a deck</Button>
      </EmptyState.Content>
    </EmptyState.Root>
  );
}
