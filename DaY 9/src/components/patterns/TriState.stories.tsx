import type { Meta, StoryObj } from '@storybook/react-vite'
import { TriState, type TriStateValue } from './TriState'

const meta = {
  title: 'Patterns/TriState',
  component: TriState,
  tags: ['autodocs'],
} satisfies Meta<typeof TriState>

export default meta
type Story = StoryObj<typeof meta>

const loading: TriStateValue<string> = { status: 'loading' }
const err: TriStateValue<string> = { status: 'error', error: 'Network failed' }
const ready: TriStateValue<string> = { status: 'ready', data: 'Ready payload' }

export const Loading: Story = {
  render: () => (
    <TriState value={loading}>
      {(s) => (s.status === 'loading' ? <p>Loading…</p> : null)}
    </TriState>
  ),
} as unknown as Story

export const ErrorState: Story = {
  render: () => (
    <TriState value={err}>
      {(s) => (s.status === 'error' ? <p role="alert">{s.error}</p> : null)}
    </TriState>
  ),
} as unknown as Story

export const Ready: Story = {
  render: () => (
    <TriState value={ready}>
      {(s) => (s.status === 'ready' ? <p>{s.data}</p> : null)}
    </TriState>
  ),
} as unknown as Story

export const AllBranches: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <TriState value={loading}>
        {(s) => (s.status === 'loading' ? <p>Loading</p> : null)}
      </TriState>
      <TriState value={err}>
        {(s) => (s.status === 'error' ? <p role="alert">Error: {s.error}</p> : null)}
      </TriState>
      <TriState value={ready}>
        {(s) => (s.status === 'ready' ? <p>Data: {s.data}</p> : null)}
      </TriState>
    </div>
  ),
} as unknown as Story
