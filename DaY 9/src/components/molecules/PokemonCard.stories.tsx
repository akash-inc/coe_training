import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { PokemonSummary } from '../../lib/pokeapi'
import { mockCharizard, mockPikachu, mockNoSprite } from '../../storybook/fixtures/pokemon'
import { PokemonCard } from './PokemonCard'

const meta = {
  component: PokemonCard,
  title: 'Molecules/PokemonCard',
  tags: ['autodocs'],
} satisfies Meta<typeof PokemonCard>

export default meta
type Story = StoryObj<typeof meta>

function Interactive({ pokemon, initiallySelected = false }: { pokemon: PokemonSummary; initiallySelected?: boolean }) {
  const [sel, setSel] = useState<PokemonSummary | null>(initiallySelected ? pokemon : null)
  return (
    <PokemonCard
      pokemon={pokemon}
      selected={sel?.id === pokemon.id}
      onSelect={setSel}
    />
  )
}

export const Default: Story = {
  render: () => <Interactive pokemon={mockPikachu} />,
} as unknown as Story
export const Selected: Story = {
  render: () => <Interactive pokemon={mockPikachu} initiallySelected />,
} as unknown as Story
export const DualTypes: Story = {
  render: () => <Interactive pokemon={mockCharizard} />,
} as unknown as Story
export const NoSprite: Story = {
  render: () => <Interactive pokemon={mockNoSprite} />,
} as unknown as Story
