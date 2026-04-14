import * as axe from 'axe-core'
import { render } from '@testing-library/react'
import Card from '../../components/Card'
import type { MusicCard } from '../../types/music'

describe('Card', () => {
  const axeOptions = {
    rules: {
      'color-contrast': { enabled: false },
    },
  }

  it('should have no accessibility violations', async () => {
    const card: MusicCard = {
      id: 7,
      title: 'Aurora',
      artist: 'Waveform',
      album: 'Skylines',
      year: 2023,
      genres: ['Electronic'],
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500',
      link: {},
    }
    const { container } = render(<Card card={card} onDelete={() => {}} onEdit={() => {}} />)
    const results = await axe.run(container, axeOptions)
    expect(results.violations.length).toBe(0)
  })
})