import Card from '../../components/Card'
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import type { MusicCard } from '../../types/music'

expect.extend(toHaveNoViolations)

describe('Card', () => {
  const card: MusicCard = {
    id: 9,
    title: 'Neon Skyline',
    artist: 'Dana',
    album: 'Night Drive',
    year: 2024,
    genres: ['Synthwave'],
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500',
    link: {
      youtube: 'https://www.youtube.com/watch?v=4NRXx6U8ABQ',
      spotify: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b',
    },
  }

  it('should have no accessibility violations', async () => {
    const { container } = render(<Card card={card} onDelete={() => {}} onEdit={() => {}} />)
    const results = await axe(container)

    expect(results).toHaveNoViolations()
    expect(container.querySelector('h3')).not.toBeNull()
    expect(container.querySelector('a[aria-label*="YouTube"]')).not.toBeNull()
  })
})