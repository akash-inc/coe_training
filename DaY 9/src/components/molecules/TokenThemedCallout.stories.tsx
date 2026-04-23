import type { Meta, StoryObj } from '@storybook/react-vite'
import { TokenThemedCallout } from './TokenThemedCallout'

const meta = {
  component: TokenThemedCallout,
  title: 'Molecules/TokenThemedCallout',
  tags: ['autodocs'],
} satisfies Meta<typeof TokenThemedCallout>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <TokenThemedCallout title="Emotion + tokens">
      <p>Styled with Emotion; colors use the shared theme object mapping to <code>var(--…)</code> tokens.</p>
    </TokenThemedCallout>
  ),
} as unknown as Story
