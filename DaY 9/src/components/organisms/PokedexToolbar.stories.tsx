import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { PokedexSort } from '../../hooks/usePokedexFilter'
import { PokedexToolbar } from './PokedexToolbar'

const defaultTypes = [
  'bug',
  'dark',
  'dragon',
  'electric',
  'fairy',
  'fighting',
  'fire',
  'flying',
  'ghost',
  'grass',
  'ground',
  'ice',
  'normal',
  'poison',
  'psychic',
  'rock',
  'steel',
  'water',
]

const meta = {
  component: PokedexToolbar,
  title: 'Organisms/PokedexToolbar',
  tags: ['autodocs'],
} satisfies Meta<typeof PokedexToolbar>

export default meta
type Story = StoryObj<typeof meta>

type ToolbarStateProps = {
  availableTypes: string[]
  totalCount: number
  visibleCount: number
  initialQuery?: string
  initialSort?: PokedexSort
  initialTypes?: Set<string>
}

function ToolbarState({
  availableTypes,
  totalCount,
  visibleCount,
  initialQuery = '',
  initialSort = 'id',
  initialTypes = new Set(),
}: ToolbarStateProps) {
  const [query, setQuery] = useState(initialQuery)
  const [sort, setSort] = useState<PokedexSort>(initialSort)
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(() => new Set(initialTypes))
  const hasActiveFilters = query.trim().length > 0 || selectedTypes.size > 0

  return (
    <PokedexToolbar
      query={query}
      onQueryChange={setQuery}
      sort={sort}
      onSortChange={setSort}
      availableTypes={availableTypes}
      selectedTypes={selectedTypes}
      onToggleType={(t) => {
        setSelectedTypes((prev) => {
          const next = new Set(prev)
          if (next.has(t)) {
            next.delete(t)
          } else {
            next.add(t)
          }
          return next
        })
      }}
      onClearFilters={() => {
        setQuery('')
        setSelectedTypes(new Set())
      }}
      visibleCount={visibleCount}
      totalCount={totalCount}
      hasActiveFilters={hasActiveFilters}
    />
  )
}

export const Default: Story = {
  render: () => (
    <ToolbarState availableTypes={defaultTypes} totalCount={12} visibleCount={8} />
  ),
} as unknown as Story

export const WithFilters: Story = {
  render: () => (
    <ToolbarState
      availableTypes={defaultTypes}
      totalCount={12}
      visibleCount={3}
      initialQuery="char"
      initialSort="name"
      initialTypes={new Set(['fire', 'flying'])}
    />
  ),
} as unknown as Story

export const TypesLoading: Story = {
  name: 'NoTypesYet',
  render: () => <ToolbarState availableTypes={[]} totalCount={0} visibleCount={0} />,
} as unknown as Story
