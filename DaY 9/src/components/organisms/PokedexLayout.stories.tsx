import type { Meta, StoryObj } from '@storybook/react-vite'
import { PokedexLayout } from './PokedexLayout'

const meta = {
  component: PokedexLayout,
  title: 'Organisms/PokedexLayout',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PokedexLayout>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <PokedexLayout
      list={<p className="m-0 text-sm text-foreground/90">Pokémon list area</p>}
      detail={<p className="m-0 text-sm text-foreground/90">Detail area</p>}
    />
  ),
} as unknown as Story

export const WithHeaderAside: Story = {
  render: () => (
    <PokedexLayout
      headerAside={<span className="text-sm text-muted-foreground">Header aside</span>}
      list={
        <div className="h-32 rounded-md border border-dashed border-border/80 p-2 text-xs text-muted-foreground">
          List
        </div>
      }
      detail={
        <div className="h-40 rounded-md border border-dashed border-border/80 p-2 text-xs text-muted-foreground">
          Detail
        </div>
      }
    />
  ),
} as unknown as Story
