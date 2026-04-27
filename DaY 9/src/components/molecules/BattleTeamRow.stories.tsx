import type { Meta, StoryObj } from '@storybook/react-vite'
import { BattleTeamRow } from './BattleTeamRow'

const nameById = new Map<number, string>([
  [25, 'pikachu'],
  [1, 'bulbasaur'],
  [4, 'charmander'],
  [7, 'squirtle'],
])

const meta = {
  component: BattleTeamRow,
  title: 'Molecules/BattleTeamRow',
  tags: ['autodocs'],
} satisfies Meta<typeof BattleTeamRow>

export default meta
type Story = StoryObj<typeof meta>

export const TeamAEmpty: Story = {
  args: {
    label: 'Team A',
    tone: 'A',
    teamIds: [],
    nameById,
    onRemove: () => {},
  },
}

export const TeamAPartial: Story = {
  args: {
    label: 'Team A',
    tone: 'A',
    teamIds: [25, 1, 4],
    nameById,
    onRemove: () => {},
  },
}

export const TeamBFull: Story = {
  args: {
    label: 'Team B',
    tone: 'B',
    teamIds: [25, 1, 4, 7, 25, 1],
    nameById,
    onRemove: () => {},
  },
}

export const TeamPair: Story = {
  render: () => (
    <div className="grid max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
      <BattleTeamRow
        label="Team A"
        tone="A"
        teamIds={[25, 1]}
        nameById={nameById}
        onRemove={() => {}}
      />
      <BattleTeamRow
        label="Team B"
        tone="B"
        teamIds={[4, 7]}
        nameById={nameById}
        onRemove={() => {}}
      />
    </div>
  ),
} as unknown as Story
