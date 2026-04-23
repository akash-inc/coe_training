import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { PokemonSummary } from '../../lib/pokeapi'
import { mockCharizard, mockPikachu, mockNoSprite } from '../../storybook/fixtures/pokemon'
import { PokemonGrid } from './PokemonGrid'

const sample: PokemonSummary[] = [mockPikachu, mockCharizard, mockNoSprite]

const meta = {
  component: PokemonGrid,
  title: 'Organisms/PokemonGrid',
  tags: ['autodocs'],
} satisfies Meta<typeof PokemonGrid>

export default meta
type Story = StoryObj<typeof meta>

function Stateful({ items, isLoading, skeletonCount }: { items: PokemonSummary[]; isLoading: boolean; skeletonCount?: number }) {
  const [selectedId, setSelected] = useState<number | null>(25)
  return (
    <PokemonGrid
      items={items}
      isLoading={isLoading}
      skeletonCount={skeletonCount}
      selectedId={selectedId}
      onSelect={(p) => {
        setSelected(p.id)
      }}
    />
  )
}

export const Loading: Story = {
  render: () => <Stateful items={[]} isLoading skeletonCount={6} />,
} as unknown as Story

export const Empty: Story = {
  render: () => <Stateful items={[]} isLoading={false} />,
} as unknown as Story

export const WithMon: Story = {
  name: 'WithPokemon',
  render: () => <Stateful items={sample} isLoading={false} />,
} as unknown as Story
