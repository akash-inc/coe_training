import { Flex, HStack, Icon, Heading } from "@chakra-ui/react";
import { LuBookOpen } from "react-icons/lu";
import { SearchBar } from "../SearchBar/SearchBar";
import { StreakBadge } from "../StreakBadge/StreakBadge";
import { UserMenu } from "../UserMenu/UserMenu";

/**
 * Top application bar: brand, deck search, study streak, and account menu.
 * Rendered as a semantic <header> with a labelled <nav> region.
 */
export function AppHeader({ appName = "FlashLearn", streak = 0, userName }) {
  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      gap={4}
      px={6}
      py={3}
      borderBottomWidth="1px"
      bg="bg.panel"
    >
      <HStack gap={2}>
        <Icon aria-hidden="true" color="blue.solid" boxSize={6}><LuBookOpen /></Icon>
        <Heading size="md">{appName}</Heading>
      </HStack>

      <Flex as="nav" aria-label="Main" align="center" gap={4}>
        <SearchBar label="Search decks" />
        <StreakBadge days={streak} />
        <UserMenu name={userName} />
      </Flex>
    </Flex>
  );
}
