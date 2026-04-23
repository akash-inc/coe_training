import type { Meta, StoryObj } from '@storybook/react-vite'
import { TypeBadge } from './TypeBadge'

const meta = {
  component: TypeBadge,
  title: 'Atoms/TypeBadge',
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'text' },
  },
} satisfies Meta<typeof TypeBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Electric: Story = { args: { type: 'electric' } }
export const Fire: Story = { args: { type: 'fire' } }
export const WithCustomClass: Story = {
  args: { type: 'water', className: 'scale-110' },
}
