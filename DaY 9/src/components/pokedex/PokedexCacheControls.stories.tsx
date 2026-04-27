import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { PokedexCacheControls } from './PokedexCacheControls'

const meta = {
  component: PokedexCacheControls,
  title: 'Pokedex/PokedexCacheControls',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        story: 'Learning controls for list cache and team save demo. Uses React Query client (provided by Storybook decorator).',
      },
    },
  },
} satisfies Meta<typeof PokedexCacheControls>

export default meta
type Story = StoryObj<typeof meta>

function Interactive() {
  const [listLive, setListLive] = useState(false)
  return <PokedexCacheControls listLive={listLive} onListLiveChange={setListLive} />
}

export const Default: Story = {
  render: () => <Interactive />,
} as unknown as Story

export const ListLiveOn: Story = {
  args: { listLive: true, onListLiveChange: () => {} },
} as unknown as Story
