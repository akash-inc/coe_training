import type { Meta, StoryObj } from '@storybook/react-vite'
import { DetailSelectPrompt } from './pokedexShells'

const meta = {
  component: DetailSelectPrompt,
  title: 'Pokedex/Shells/DetailSelectPrompt',
  tags: ['autodocs'],
} satisfies Meta<typeof DetailSelectPrompt>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <DetailSelectPrompt>
      <p className="m-0 max-w-sm text-center text-[0.95rem] text-muted-foreground">Select a Pokémon from the list.</p>
    </DetailSelectPrompt>
  ),
} as unknown as Story
