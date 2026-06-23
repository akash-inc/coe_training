import { StreakBadge } from "./StreakBadge";

export default {
  title: "Flashcards/StreakBadge",
  component: StreakBadge,
  args: { days: 12 },
};

export const Default = {};
export const SingleDay = { args: { days: 1 } };
export const LongStreak = { args: { days: 365 } };
