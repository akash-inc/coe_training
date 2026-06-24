import {
  Box, Container, Stack, Flex, HStack, SimpleGrid, Heading, Text,
} from "@chakra-ui/react";
import { LuBrain, LuTrendingUp, LuClock } from "react-icons/lu";

import { AppHeader } from "../components/AppHeader/AppHeader";
import { StatCard } from "../components/StatCard/StatCard";
import { InlineAlert } from "../components/InlineAlert/InlineAlert";
import { Flashcard } from "../components/Flashcard/Flashcard";
import { RatingControl } from "../components/RatingControl/RatingControl";
import { ProgressBar } from "../components/ProgressBar/ProgressBar";
import { DifficultyBadge } from "../components/DifficultyBadge/DifficultyBadge";
import { CategoryTag } from "../components/CategoryTag/CategoryTag";
import { SearchBar } from "../components/SearchBar/SearchBar";
import { StudyTabs } from "../components/StudyTabs/StudyTabs";
import { DeckCard } from "../components/DeckCard/DeckCard";
import { DeckPagination } from "../components/DeckPagination/DeckPagination";
import { FaqAccordion } from "../components/FaqAccordion/FaqAccordion";
import { EmptyDecks } from "../components/EmptyDecks/EmptyDecks";
import { LoadingState } from "../components/LoadingState/LoadingState";
import { CreateDeckDialog } from "../components/CreateDeckDialog/CreateDeckDialog";

const DECKS = [
  { title: "Spanish Vocabulary", description: "Everyday words and phrases.", cardCount: 120, progress: 45, category: "Language" },
  { title: "World Capitals", description: "Capital cities of every country.", cardCount: 195, progress: 72, category: "Geography" },
  { title: "Cell Biology", description: "Organelles, mitosis, and more.", cardCount: 84, progress: 30, category: "Science" },
  { title: "React Hooks", description: "useState, useEffect, and friends.", cardCount: 42, progress: 88, category: "Programming" },
];

function DeckGrid() {
  return (
    <Stack gap={6}>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
        {DECKS.map((deck) => (
          <DeckCard key={deck.title} {...deck} onStudy={() => {}} />
        ))}
      </SimpleGrid>
      <Flex justify="center">
        <DeckPagination count={48} pageSize={4} defaultPage={1} />
      </Flex>
    </Stack>
  );
}

const FAQ_ITEMS = [
  { value: "srs", question: "What is spaced repetition?", answer: "Reviews are scheduled at growing intervals to maximize long-term retention with minimal effort." },
  { value: "reset", question: "Can I reset a deck's progress?", answer: "Yes — open deck settings and choose Reset progress." },
  { value: "share", question: "How do I share a deck?", answer: "Use the Share button on any deck to generate a public link." },
];

/**
 * Full demo page that composes the entire flashcard component library into a
 * realistic learning dashboard.
 */
export function FlashcardApp() {
  return (
    <Box minH="100vh" bg="bg.subtle">
      <AppHeader appName="FlashLearn" streak={12} userName="Jane Learner" />

      <Container as="main" maxW="5xl" py={10}>
        <Stack gap={12}>
          {/* Greeting + primary action */}
          <Flex justify="space-between" align="center" gap={4} wrap="wrap">
            <Box>
              <Heading size="xl">Good evening, Jane</Heading>
              <Text color="fg.muted">You have 24 cards due for review today.</Text>
            </Box>
            <CreateDeckDialog triggerLabel="New deck" />
          </Flex>

          <InlineAlert status="info" title="Daily review ready">
            24 cards across 3 decks are due. Keep your 12-day streak alive!
          </InlineAlert>

          {/* Stats */}
          <SimpleGrid columns={{ base: 1, sm: 3 }} gap={4}>
            <StatCard label="Cards reviewed" value="1,284" helpText="+128 this week" icon={<LuBrain />} />
            <StatCard label="Accuracy" value="92%" helpText="+3% vs last week" icon={<LuTrendingUp />} />
            <StatCard label="Time studied" value="6h 12m" helpText="This week" icon={<LuClock />} />
          </SimpleGrid>

          {/* Study session */}
          <Stack gap={4} as="section" aria-labelledby="review-heading">
            <Heading size="lg" id="review-heading">Today's review</Heading>
            <Flex gap={8} align="center" wrap="wrap">
              <Flashcard
                front="¿Cómo estás?"
                back="How are you?"
                category="Spanish"
              />
              <Stack gap={6} flex="1" minW="16rem">
                <HStack>
                  <Text fontSize="sm" color="fg.muted">Difficulty:</Text>
                  <DifficultyBadge level="medium" />
                </HStack>
                <ProgressBar label="Session progress" value={40} />
                <RatingControl onRate={() => {}} />
              </Stack>
            </Flex>
          </Stack>

          {/* Decks */}
          <Stack gap={4} as="section" aria-labelledby="decks-heading">
            <Flex justify="space-between" align="end" gap={4} wrap="wrap">
              <Heading size="lg" id="decks-heading">Your decks</Heading>
              <SearchBar label="Search decks" />
            </Flex>

            <HStack gap={2} wrap="wrap">
              <Text fontSize="sm" color="fg.muted">Filters:</Text>
              <CategoryTag colorPalette="purple" onClose={() => {}}>Language</CategoryTag>
              <CategoryTag colorPalette="green" onClose={() => {}}>Science</CategoryTag>
            </HStack>

            <StudyTabs
              tabs={[
                { value: "due", label: "Due (4)", content: <DeckGrid /> },
                { value: "new", label: "New", content: <LoadingState label="Loading new decks…" /> },
                { value: "learned", label: "Learned", content: <EmptyDecks onCreate={() => {}} /> },
              ]}
            />
          </Stack>

          {/* FAQ */}
          <Stack gap={4} as="section" aria-labelledby="faq-heading">
            <Heading size="lg" id="faq-heading">Frequently asked</Heading>
            <FaqAccordion items={FAQ_ITEMS} defaultValue={["srs"]} />
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
