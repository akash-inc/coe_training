import type { Meta, StoryObj } from '@storybook/react-vite'
import { useLayoutEffect, type ReactNode } from 'react'
import type { BattleTurn } from '../../lib/battle/simulateBattle'
import { useBattleStore } from '../../stores/battleStore'
import { BattlePanel } from './BattlePanel'

const meta = {
  component: BattlePanel,
  title: 'Pokedex/BattlePanel',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'Battle UI with Zustand. “With seeded log” loads a finished battle without network. “Empty” resets the store.',
      },
    },
  },
} satisfies Meta<typeof BattlePanel>

export default meta
type Story = StoryObj<typeof meta>

const mockTurns: BattleTurn[] = [
  {
    turnIndex: 0,
    side: 'A',
    actorName: 'pikachu',
    targetName: 'bulbasaur',
    moveName: 'quick-attack',
    moveNameDisplay: 'Quick Attack',
    damage: 14,
    hpAfterA: [100],
    hpAfterB: [86],
    winner: null,
  },
  {
    turnIndex: 1,
    side: 'B',
    actorName: 'bulbasaur',
    targetName: 'pikachu',
    moveName: 'tackle',
    moveNameDisplay: 'Tackle',
    damage: 11,
    hpAfterA: [89],
    hpAfterB: [86],
    winner: null,
  },
  {
    turnIndex: 2,
    side: 'A',
    actorName: 'pikachu',
    targetName: 'bulbasaur',
    moveName: 'thunder-shock',
    moveNameDisplay: 'Thunder Shock',
    damage: 40,
    hpAfterA: [89],
    hpAfterB: [46],
    winner: null,
  },
  {
    turnIndex: 3,
    side: 'B',
    actorName: 'bulbasaur',
    targetName: 'pikachu',
    moveName: 'vine-whip',
    moveNameDisplay: 'Vine Whip',
    damage: 22,
    hpAfterA: [67],
    hpAfterB: [46],
    winner: null,
  },
  {
    turnIndex: 4,
    side: 'A',
    actorName: 'pikachu',
    targetName: 'bulbasaur',
    moveName: 'quick-attack',
    moveNameDisplay: 'Quick Attack',
    damage: 46,
    hpAfterA: [67],
    hpAfterB: [0],
    winner: 'A',
  },
]

function resetBattleStore() {
  useBattleStore.setState({
    partyAIds: [],
    partyBIds: [],
    turns: null,
    maxHpA: null,
    maxHpB: null,
    playhead: 0,
    status: 'idle',
    errorMessage: null,
  })
}

function SeedBattle({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    useBattleStore.setState({
      partyAIds: [25],
      partyBIds: [1],
      turns: mockTurns,
      maxHpA: [100],
      maxHpB: [100],
      playhead: mockTurns.length,
      status: 'done',
      errorMessage: null,
    })
    return () => resetBattleStore()
  }, [])
  return <>{children}</>
}

function ResetOnMount({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    resetBattleStore()
    return () => resetBattleStore()
  }, [])
  return <>{children}</>
}

const nameById = new Map<number, string>([
  [25, 'pikachu'],
  [1, 'bulbasaur'],
])

export const WithSeededLog: Story = {
  render: (args) => (
    <SeedBattle>
      <BattlePanel {...args} />
    </SeedBattle>
  ),
  args: {
    selected: { id: 4, name: 'charmander', spriteUrl: null, types: ['fire'] },
    nameById,
  },
}

export const Empty: Story = {
  render: (args) => (
    <ResetOnMount>
      <BattlePanel {...args} />
    </ResetOnMount>
  ),
  args: {
    selected: null,
    nameById: new Map(),
  },
}
