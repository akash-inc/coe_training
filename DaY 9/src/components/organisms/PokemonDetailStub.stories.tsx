import type { Meta, StoryObj } from '@storybook/react-vite'
import { mockCharizard, mockPikachu } from '../../storybook/fixtures/pokemon'
import { PokemonDetailStub } from './PokemonDetailStub'

const meta = {
  component: PokemonDetailStub,
  title: 'Organisms/PokemonDetailStub',
  tags: ['autodocs'],
} satisfies Meta<typeof PokemonDetailStub>

export default meta
type Story = StoryObj<typeof meta>

export const Unselected: Story = {
  name: 'EmptySelection',
  render: () => <PokemonDetailStub pokemon={null} />,
} as unknown as Story

export const Pikachu: Story = { args: { pokemon: mockPikachu } }
export const Charizard: Story = { args: { pokemon: mockCharizard } }
