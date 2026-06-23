import { HStack, Icon, Text } from "@chakra-ui/react";
import { LuFlame } from "react-icons/lu";

/**
 * Daily study streak indicator. The flame is decorative; the streak is
 * conveyed as text with a descriptive aria-label on the group.
 */
export function StreakBadge({ days = 0 }) {
  return (
    <HStack
      gap={1.5}
      px={3}
      py={1.5}
      borderRadius="full"
      bg="orange.subtle"
      color="orange.fg"
      aria-label={`${days} day study streak`}
    >
      <Icon aria-hidden="true"><LuFlame /></Icon>
      <Text fontWeight="semibold" fontSize="sm">
        {days} day{days === 1 ? "" : "s"}
      </Text>
    </HStack>
  );
}
