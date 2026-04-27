import type { Meta, StoryObj } from '@storybook/react-vite'
import { HpBar } from './HpBar'

const meta = {
  component: HpBar,
  title: 'Atoms/HpBar',
  tags: ['autodocs'],
  argTypes: {
    current: { control: { type: 'number', min: 0, max: 200 } },
    max: { control: { type: 'number', min: 1, max: 200 } },
  },
} satisfies Meta<typeof HpBar>

export default meta
type Story = StoryObj<typeof meta>

export const Full: Story = { args: { current: 100, max: 100 } }
export const High: Story = { args: { current: 80, max: 100 } }
export const Mid: Story = { args: { current: 40, max: 100 } }
export const Low: Story = { args: { current: 12, max: 100 } }
export const Tiny: Story = { args: { current: 45, max: 100, tiny: true } }

export const AllBands: Story = {
  render: () => (
    <div className="flex w-64 max-w-full flex-col gap-3">
      <HpBar current={100} max={100} />
      <HpBar current={55} max={100} />
      <HpBar current={20} max={100} />
      <HpBar current={3} max={100} />
    </div>
  ),
} as unknown as Story
