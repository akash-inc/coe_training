import type { Meta, StoryObj } from '@storybook/react-vite'
import { IdChip } from './IdChip'

const meta = {
  component: IdChip,
  title: 'Atoms/IdChip',
  tags: ['autodocs'],
  argTypes: { id: { control: { type: 'number', min: 1, max: 1025, step: 1 } } },
} satisfies Meta<typeof IdChip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { id: 25 } }
export const FirstEntry: Story = { args: { id: 1 } }
export const LargeId: Story = { args: { id: 1025 } }
