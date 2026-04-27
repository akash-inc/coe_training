import type { Meta, StoryObj } from '@storybook/react-vite'
import { TeamStrip } from './TeamStrip'

const nameById = new Map<number, string>([
  [25, 'pikachu'],
  [1, 'bulbasaur'],
  [4, 'charmander'],
])

const meta = {
  component: TeamStrip,
  title: 'Pokedex/TeamStrip',
  tags: ['autodocs'],
} satisfies Meta<typeof TeamStrip>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    teamIds: [],
    nameById,
    busy: false,
    lastActionMessage: null,
  },
}

export const Partial: Story = {
  args: {
    teamIds: [25, 1],
    nameById,
    busy: false,
  },
}

export const Full: Story = {
  args: {
    teamIds: [25, 1, 4, 7, 25, 1],
    nameById,
    busy: false,
  },
}

export const Saving: Story = {
  args: {
    teamIds: [25, 1, 4],
    nameById,
    busy: true,
  },
}

export const WithError: Story = {
  args: {
    teamIds: [25],
    nameById,
    busy: false,
    lastActionMessage: 'Could not save your party. Try again.',
  },
}
