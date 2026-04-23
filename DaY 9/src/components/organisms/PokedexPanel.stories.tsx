import type { Meta, StoryObj } from '@storybook/react-vite'
import { PokedexPanel } from './PokedexPanel'

const meta = {
  component: PokedexPanel,
  title: 'Organisms/PokedexPanel',
  tags: ['autodocs'],
} satisfies Meta<typeof PokedexPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <PokedexPanel>
      <p className="m-0 text-sm text-foreground/90">Panel content uses the withCardSurface HOC on a semantic section.</p>
    </PokedexPanel>
  ),
} as unknown as Story

export const Stacked: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-3">
      <PokedexPanel>
        <p className="m-0 text-sm">List column</p>
      </PokedexPanel>
      <PokedexPanel>
        <p className="m-0 text-sm">Detail column</p>
      </PokedexPanel>
    </div>
  ),
} as unknown as Story
