import {
  Dialog, Portal, Field, Input, Textarea, Stack, CloseButton,
} from "@chakra-ui/react";
import { Button } from "../Button/Button";

/**
 * Modal dialog for creating a new deck. Chakra's Dialog traps focus, wires
 * aria-modal/labelledby, and closes on Escape. Inputs are labeled via Field.
 */
export function CreateDeckDialog({ triggerLabel = "New deck", defaultOpen = false }) {
  return (
    <Dialog.Root defaultOpen={defaultOpen} role="dialog">
      <Dialog.Trigger asChild>
        <Button colorPalette="blue">{triggerLabel}</Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Create a new deck</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap={4}>
                <Field.Root required>
                  <Field.Label>
                    Deck name <Field.RequiredIndicator />
                  </Field.Label>
                  <Input placeholder="e.g. French Verbs" />
                </Field.Root>
                <Field.Root>
                  <Field.Label>Description</Field.Label>
                  <Textarea placeholder="What is this deck about?" />
                </Field.Root>
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline" colorPalette="gray">Cancel</Button>
              </Dialog.ActionTrigger>
              <Button colorPalette="blue">Create deck</Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton aria-label="Close dialog" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
