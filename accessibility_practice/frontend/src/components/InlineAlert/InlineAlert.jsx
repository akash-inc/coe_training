import { Alert } from "@chakra-ui/react";

/**
 * Inline status message (info / success / warning / error) for things like
 * "Deck saved" or "Review session due". Wraps Chakra's accessible Alert.
 */
export function InlineAlert({ status = "info", title, children }) {
  return (
    <Alert.Root status={status} maxW="md">
      <Alert.Indicator />
      <Alert.Content>
        {title && <Alert.Title>{title}</Alert.Title>}
        {children && <Alert.Description>{children}</Alert.Description>}
      </Alert.Content>
    </Alert.Root>
  );
}
