import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { withCardSurface } from './withCardSurface'

function Block({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={className}>{children}</div>
}
Block.displayName = 'Block'

const BorderedBlock = withCardSurface(
  'rounded-lg border border-border bg-card p-3 text-sm text-foreground',
)(Block)

const meta = {
  component: BorderedBlock,
  title: 'Patterns/withCardSurface',
  tags: ['autodocs'],
} satisfies Meta<typeof BorderedBlock>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <BorderedBlock>
      The HOC prepends a shared surface <code className="rounded-sm bg-code px-1">className</code> before the inner
      component’s own classes.
    </BorderedBlock>
  ),
} as unknown as Story
