import type { Meta, StoryObj } from '@storybook/react-vite'
import { PokedexApp } from './PokedexApp'

const meta = {
  component: PokedexApp,
  title: 'Pokedex/PokedexApp',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          'Fetches a page of species from the public PokéAPI. Needs network access; first load can take a moment.',
      },
    },
  },
} satisfies Meta<typeof PokedexApp>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <PokedexApp />,
} as unknown as Story
