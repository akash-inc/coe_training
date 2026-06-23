import { Tag } from "@chakra-ui/react";

/**
 * A category/topic chip. Optionally closable (for active filters).
 * When closable, pass `onClose` — the close button gets an accessible label.
 */
export function CategoryTag({ children, colorPalette = "gray", onClose }) {
  return (
    <Tag.Root colorPalette={colorPalette} variant="subtle">
      <Tag.Label>{children}</Tag.Label>
      {onClose && (
        <Tag.EndElement>
          <Tag.CloseTrigger aria-label={`Remove ${children} filter`} onClick={onClose} />
        </Tag.EndElement>
      )}
    </Tag.Root>
  );
}
