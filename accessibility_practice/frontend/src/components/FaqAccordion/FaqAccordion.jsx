import { Accordion } from "@chakra-ui/react";

/**
 * FAQ / help accordion. Chakra's Accordion manages aria-expanded and
 * region semantics; each trigger is a button with a visible indicator.
 */
export function FaqAccordion({ items, defaultValue = [] }) {
  return (
    <Accordion.Root collapsible defaultValue={defaultValue} maxW="lg">
      {items.map((item) => (
        <Accordion.Item key={item.value} value={item.value}>
          <Accordion.ItemTrigger>
            {item.question}
            <Accordion.ItemIndicator />
          </Accordion.ItemTrigger>
          <Accordion.ItemContent>
            <Accordion.ItemBody>{item.answer}</Accordion.ItemBody>
          </Accordion.ItemContent>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
