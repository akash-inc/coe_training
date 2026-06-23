import { Card, Stat, Icon, HStack, Box, Text } from "@chakra-ui/react";

/**
 * A single learning statistic (cards reviewed, accuracy, time studied…).
 * Uses Chakra's Stat for correct label/value semantics.
 *
 * Stat renders a <dl>, which may only directly contain <dt>/<dd> groups. Two
 * things therefore live *outside* Stat.Root: the icon, and the help text —
 * Chakra's Stat.HelpText renders a <span> that would otherwise be an invalid
 * direct child of the <dl> (caught by the a11y test).
 */
export function StatCard({ label, value, helpText, icon }) {
  return (
    <Card.Root w="3xs">
      <Card.Body>
        <HStack justify="space-between" align="start">
          <Box>
            <Stat.Root>
              <Stat.Label>{label}</Stat.Label>
              <Stat.ValueText>{value}</Stat.ValueText>
            </Stat.Root>
            {helpText && (
              <Text fontSize="sm" color="fg.muted" mt={1}>{helpText}</Text>
            )}
          </Box>
          {icon && <Icon aria-hidden="true" color="fg.muted">{icon}</Icon>}
        </HStack>
      </Card.Body>
    </Card.Root>
  );
}
