import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { PanelModeToggle, type PokedexRightPanelMode } from './PanelModeToggle'

const meta = {
  component: PanelModeToggle,
  title: 'Molecules/PanelModeToggle',
  tags: ['autodocs'],
} satisfies Meta<typeof PanelModeToggle>

export default meta
type Story = StoryObj<typeof meta>

function Stateful({ initialMode }: { initialMode: PokedexRightPanelMode }) {
  const [v, setV] = useState<PokedexRightPanelMode>(initialMode)
  return <PanelModeToggle value={v} onChange={setV} />
}

export const Details: Story = {
  render: () => <Stateful initialMode="details" />,
} as unknown as Story

export const Battle: Story = {
  render: () => <Stateful initialMode="battle" />,
} as unknown as Story

export const Default: Story = {
  args: { value: 'details', onChange: () => {} },
} as unknown as Story
