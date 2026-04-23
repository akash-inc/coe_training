import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ColorMode, VisualStyle } from '../../lib/themeStorage'
import { ThemeControls } from './ThemeControls'

const meta = {
  component: ThemeControls,
  title: 'Organisms/ThemeControls',
  tags: ['autodocs'],
} satisfies Meta<typeof ThemeControls>

export default meta
type Story = StoryObj<typeof meta>

function Stateful() {
  const [colorMode, setColorMode] = useState<ColorMode>('light')
  const [visualStyle, setVisualStyle] = useState<VisualStyle>('default')
  return (
    <ThemeControls
      colorMode={colorMode}
      onColorModeChange={setColorMode}
      visualStyle={visualStyle}
      onVisualStyleChange={setVisualStyle}
      resolved={colorMode === 'system' ? 'light' : colorMode}
    />
  )
}

function SystemResolved() {
  const [colorMode, setColorMode] = useState<ColorMode>('system')
  const [visualStyle, setVisualStyle] = useState<VisualStyle>('default')
  return (
    <ThemeControls
      colorMode={colorMode}
      onColorModeChange={setColorMode}
      visualStyle={visualStyle}
      onVisualStyleChange={setVisualStyle}
      resolved="dark"
    />
  )
}

function ColorfulDemo() {
  const [visualStyle, setVisualStyle] = useState<VisualStyle>('colorful')
  return (
    <ThemeControls
      colorMode="light"
      onColorModeChange={() => undefined}
      visualStyle={visualStyle}
      onVisualStyleChange={setVisualStyle}
      resolved="light"
    />
  )
}

export const Default: Story = { render: () => <Stateful /> } as unknown as Story
export const SystemWithResolved: Story = { render: () => <SystemResolved /> } as unknown as Story
export const Colorful: Story = { render: () => <ColorfulDemo /> } as unknown as Story
