import type { Meta, StoryObj } from '@storybook/react-vite'
import { ComponentsShowcase } from './ComponentsShowcase'

const meta = {
  component: ComponentsShowcase,
  title: 'Showcase/ComponentsShowcase',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ComponentsShowcase>

export default meta
type Story = StoryObj<typeof meta>

export const Lab: Story = { render: () => <ComponentsShowcase /> } as unknown as Story
