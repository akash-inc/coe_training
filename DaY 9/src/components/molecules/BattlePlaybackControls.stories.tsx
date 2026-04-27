import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { BattlePlaybackControls } from './BattlePlaybackControls'

const TURN_LEN = 8

function Interactive() {
  const [playhead, setPlayhead] = useState(3)
  const positionLabel =
    playhead === 0
      ? 'Start'
      : playhead === TURN_LEN
        ? `End (${TURN_LEN} moves)`
        : `After turn ${playhead} of ${TURN_LEN}`

  return (
    <div className="w-full max-w-md">
      <BattlePlaybackControls
        playhead={playhead}
        turnLen={TURN_LEN}
        onToStart={() => setPlayhead(0)}
        onStep={(d) => setPlayhead((p) => Math.max(0, Math.min(TURN_LEN, p + d)))}
        onToEnd={() => setPlayhead(TURN_LEN)}
        onPlayheadChange={setPlayhead}
        positionLabel={positionLabel}
      />
    </div>
  )
}

const meta = {
  component: BattlePlaybackControls,
  title: 'Molecules/BattlePlaybackControls',
  tags: ['autodocs'],
} satisfies Meta<typeof BattlePlaybackControls>

export default meta
type Story = StoryObj<typeof meta>

export const InteractiveState: Story = {
  render: () => <Interactive />,
} as unknown as Story

export const AtStart: Story = {
  args: {
    playhead: 0,
    turnLen: 5,
    onToStart: () => {},
    onStep: () => {},
    onToEnd: () => {},
    onPlayheadChange: () => {},
    positionLabel: 'Start',
  },
}

export const AtEnd: Story = {
  args: {
    playhead: 5,
    turnLen: 5,
    onToStart: () => {},
    onStep: () => {},
    onToEnd: () => {},
    onPlayheadChange: () => {},
    positionLabel: 'End (5 moves)',
  },
}
