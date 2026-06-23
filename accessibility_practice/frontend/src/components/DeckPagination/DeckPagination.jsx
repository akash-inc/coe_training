import { Pagination, ButtonGroup, IconButton } from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

/**
 * Pagination for browsing decks. Chakra's Pagination labels the prev/next/page
 * controls and exposes the current page via aria-current.
 */
export function DeckPagination({ count, pageSize = 12, defaultPage = 1, onPageChange }) {
  return (
    <Pagination.Root count={count} pageSize={pageSize} defaultPage={defaultPage} onPageChange={onPageChange}>
      <ButtonGroup variant="ghost" size="sm">
        <Pagination.PrevTrigger asChild>
          <IconButton aria-label="Previous page"><LuChevronLeft /></IconButton>
        </Pagination.PrevTrigger>
        <Pagination.Items
          render={(page) => (
            <IconButton variant={{ base: "ghost", _selected: "outline" }} aria-label={`Page ${page.value}`}>
              {page.value}
            </IconButton>
          )}
        />
        <Pagination.NextTrigger asChild>
          <IconButton aria-label="Next page"><LuChevronRight /></IconButton>
        </Pagination.NextTrigger>
      </ButtonGroup>
    </Pagination.Root>
  );
}
