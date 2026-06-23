import { Field, Input, InputGroup, Icon } from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";

/**
 * Labeled search input for finding decks. The Field provides a real <label>
 * association; the icon is decorative (aria-hidden).
 */
export function SearchBar({ label = "Search decks", placeholder = "Search decks…", value, onChange }) {
  return (
    <Field.Root maxW="sm">
      <Field.Label>{label}</Field.Label>
      <InputGroup startElement={<Icon aria-hidden="true"><LuSearch /></Icon>}>
        <Input
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
        />
      </InputGroup>
    </Field.Root>
  );
}
