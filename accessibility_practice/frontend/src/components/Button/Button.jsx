import { Button as ChakraButton } from "@chakra-ui/react";

/**
 * Thin wrapper over Chakra's Button so the library has a single, documented
 * entry point. Renders a native <button> (keyboard-activatable, correct role).
 *
 * Icon-only buttons MUST pass `aria-label` to stay accessible.
 */
export function Button({ children, ...props }) {
  return <ChakraButton {...props}>{children}</ChakraButton>;
}
