import { cn } from './cn'

export const headlessTabListClass = 'flex flex-wrap gap-1 border-b border-border'

/** <Tab> className (underline) for @headlessui/react, aligned with the old custom Tabs. */
export function headlessTabClass({
  selected,
  focus: focusRing,
}: {
  selected: boolean
  focus: boolean
}) {
  return cn(
    '-mb-px border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition-colors',
    'hover:text-foreground',
    focusRing && 'outline outline-2 outline-offset-2 outline-accent',
    selected && 'border-accent text-foreground',
  )
}
