import { Stack } from "@chakra-ui/react";
import { InlineAlert } from "./InlineAlert";

export default {
  title: "Flashcards/InlineAlert",
  component: InlineAlert,
  args: { status: "info", title: "Review due", children: "You have 24 cards to review today." },
};

export const Info = {};
export const Success = { args: { status: "success", title: "Deck saved", children: "Your changes were saved." } };
export const Warning = { args: { status: "warning", title: "Streak at risk", children: "Study today to keep your streak." } };
export const Error = { args: { status: "error", title: "Sync failed", children: "We couldn't sync your progress." } };

export const AllStatuses = {
  render: () => (
    <Stack gap={3}>
      <InlineAlert status="info" title="Review due">24 cards to review.</InlineAlert>
      <InlineAlert status="success" title="Deck saved">Changes saved.</InlineAlert>
      <InlineAlert status="warning" title="Streak at risk">Study today.</InlineAlert>
      <InlineAlert status="error" title="Sync failed">Couldn't sync progress.</InlineAlert>
    </Stack>
  ),
};
