import type { Meta, StoryObj } from '@storybook/react-vite'
import { ListFetchError } from './pokedexShells'

const meta = {
  component: ListFetchError,
  title: 'Pokedex/Shells/ListFetchError',
  tags: ['autodocs'],
} satisfies Meta<typeof ListFetchError>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <ListFetchError className="text-foreground" role="alert">
      <p className="m-0">Could not load the PokéAPI data.</p>
    </ListFetchError>
  ),
} as unknown as Story
