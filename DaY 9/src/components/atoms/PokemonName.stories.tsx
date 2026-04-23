import type { Meta, StoryObj } from '@storybook/react-vite'
import { PokemonName } from './PokemonName'

const meta = {
  component: PokemonName,
  title: 'Atoms/PokemonName',
  tags: ['autodocs'],
  argTypes: {
    as: { control: 'select', options: ['h1', 'h2', 'span', 'p'] },
  },
} satisfies Meta<typeof PokemonName>

export default meta
type Story = StoryObj<typeof meta>

export const Pika: Story = { args: { name: 'pikachu' } }
export const Hyphenated: Story = { args: { name: 'mr-mime', as: 'h2' } }
export const WithClass: Story = { args: { name: 'charizard', className: 'text-accent' } }
