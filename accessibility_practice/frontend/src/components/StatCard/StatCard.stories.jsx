import { HStack } from "@chakra-ui/react";
import { LuBrain, LuTrendingUp, LuClock } from "react-icons/lu";
import { StatCard } from "./StatCard";

export default {
  title: "Flashcards/StatCard",
  component: StatCard,
  args: { label: "Cards reviewed", value: "1,284", helpText: "+128 this week" },
};

export const Default = {};

export const Dashboard = {
  render: () => (
    <HStack gap={4} align="stretch">
      <StatCard label="Cards reviewed" value="1,284" helpText="+128 this week" icon={<LuBrain />} />
      <StatCard label="Accuracy" value="92%" helpText="+3% vs last week" icon={<LuTrendingUp />} />
      <StatCard label="Time studied" value="6h 12m" helpText="This week" icon={<LuClock />} />
    </HStack>
  ),
};
