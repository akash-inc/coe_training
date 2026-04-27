import type { Meta, StoryObj } from '@storybook/react-vite'
import { BattleTurnLine } from './BattleTurnLine'

const meta = {
  component: BattleTurnLine,
  title: 'Molecules/BattleTurnLine',
  tags: ['autodocs'],
} satisfies Meta<typeof BattleTurnLine>

export default meta
type Story = StoryObj<typeof meta>

export const TeamA: Story = {
  args: {
    side: 'A',
    actorName: 'pikachu',
    moveNameDisplay: 'Thunder Shock',
    targetName: 'bulbasaur',
    damage: 24,
  },
}

export const TeamB: Story = {
  args: {
    side: 'B',
    actorName: 'bulbasaur',
    moveNameDisplay: 'Tackle',
    targetName: 'pikachu',
    damage: 11,
  },
}

export const Dimmed: Story = {
  args: {
    side: 'A',
    actorName: 'pikachu',
    moveNameDisplay: 'Thunder Shock',
    targetName: 'bulbasaur',
    damage: 24,
    dimmed: true,
  },
}
export const Current: Story = {
  args: {
    side: 'A',
    actorName: 'pikachu',
    moveNameDisplay: 'Thunder Shock',
    targetName: 'bulbasaur',
    damage: 24,
    current: true,
  },
}

export const ShortList: Story = {
  render: () => (
    <ul className="m-0 max-w-md list-none space-y-1 rounded border border-border/50 p-2 text-xs">
      <BattleTurnLine
        side="A"
        actorName="pikachu"
        moveNameDisplay="Quick Attack"
        targetName="bulbasaur"
        damage={14}
        dimmed
      />
      <BattleTurnLine
        side="B"
        actorName="bulbasaur"
        moveNameDisplay="Razor Leaf"
        targetName="pikachu"
        damage={20}
        current
      />
      <BattleTurnLine side="A" actorName="pikachu" moveNameDisplay="Electro Ball" targetName="bulbasaur" damage={33} />
    </ul>
  ),
} as unknown as Story
