import { Tabs } from "@chakra-ui/react";

/**
 * Tabbed view for organizing study queues (Due / New / Learned).
 * Chakra's Tabs are keyboard-navigable with correct tab/tabpanel roles.
 */
export function StudyTabs({ tabs, defaultValue }) {
  const value = defaultValue ?? tabs?.[0]?.value;
  return (
    <Tabs.Root defaultValue={value} maxW="lg">
      <Tabs.List>
        {tabs.map((t) => (
          <Tabs.Trigger key={t.value} value={t.value}>
            {t.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {tabs.map((t) => (
        <Tabs.Content key={t.value} value={t.value}>
          {t.content}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
